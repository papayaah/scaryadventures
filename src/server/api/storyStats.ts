import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';
import { StoryStatistics } from '../../shared/types/api';

// Get statistics for a specific story
export const getStoryStatistics = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    console.log(`Getting statistics for story: ${storyId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - returning mock story stats');
      // Local development fallback - return mock data
      const mockStats: StoryStatistics = {
        storyId,
        totalPlayed: 42,
        totalCompleted: 35,
        totalAbandoned: 7,
        completionRate: 83,
        averageRating: 4.3,
        totalRatings: 28,
        totalPlayTime: 3600, // 1 hour total
        averagePlayTime: 900 // 15 minutes average
      };
      
      return res.json(mockStats);
    }

    // Get story analytics from Redis with error handling
    let totalPlayed = 0;
    let totalCompleted = 0;
    let totalAbandoned = 0;
    let completionRate = 0;
    
    try {
      const startedKey = `analytics:story:${storyId}:started`;
      const completedKey = `analytics:story:${storyId}:completed`;
      
      const startedCount = await redis.get(startedKey);
      const completedCount = await redis.get(completedKey);
      
      totalPlayed = parseInt(startedCount || '0');
      totalCompleted = parseInt(completedCount || '0');
      totalAbandoned = totalPlayed - totalCompleted;
      completionRate = totalPlayed > 0 ? Math.round((totalCompleted / totalPlayed) * 100) : 0;
    } catch (error) {
      console.warn(`Error getting analytics for story ${storyId}:`, error);
      // Use defaults (already set above)
    }

    // Get rating statistics with error handling
    let averageRating = 0;
    let totalRatings = 0;
    
    try {
      const ratingsKey = `story_ratings:${storyId}`;
      const ratingsJson = await redis.get(ratingsKey);
      const ratings = ratingsJson ? JSON.parse(ratingsJson) : {};
      
      const ratingValues = Object.values(ratings) as number[];
      totalRatings = ratingValues.length;
      averageRating = totalRatings > 0 
        ? Math.round((ratingValues.reduce((sum, rating) => sum + rating, 0) / totalRatings) * 10) / 10
        : 0;
    } catch (error) {
      console.warn(`Error getting ratings for story ${storyId}:`, error);
      // Use defaults (already set above)
    }

    // Get completion time statistics with error handling
    let totalPlayTime = 0;
    let averagePlayTime = 0;
    
    try {
      const storyCompletionTimesKey = `story_completion_times:${storyId}`;
      const completionTimesJson = await redis.get(storyCompletionTimesKey);
      const completionTimes = completionTimesJson ? JSON.parse(completionTimesJson) : [];
      
      totalPlayTime = completionTimes.reduce((sum: number, time: number) => sum + time, 0);
      averagePlayTime = completionTimes.length > 0 
        ? Math.round(totalPlayTime / completionTimes.length) 
        : 0;
    } catch (error) {
      console.warn(`Error getting completion times for story ${storyId}:`, error);
      // Use defaults (already set above)
    }

    const stats: StoryStatistics = {
      storyId,
      totalPlayed,
      totalCompleted,
      totalAbandoned,
      completionRate,
      averageRating,
      totalRatings,
      totalPlayTime,
      averagePlayTime
    };

    console.log(`Story stats for ${storyId}:`, stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting story statistics:', error);
    res.status(500).json({ error: 'Failed to get story statistics' });
  }
};
