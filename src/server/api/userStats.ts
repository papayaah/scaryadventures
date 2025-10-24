import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';
import { UserStats } from '../../shared/types/api';

// Helper functions to get Redis keys
const getUserRatingsKey = (userId: string) => `user_ratings:${userId}`;
const getUserCompletionsKey = (userId: string) => `user_completions:${userId}`;
const getUserStreakKey = (userId: string) => `user_streak:${userId}`;

// Get comprehensive user statistics
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Getting user stats for user: ${userId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - returning mock stats');
      // Local development fallback - return mock data
      const mockStats: UserStats = {
        totalCompleted: 12,
        totalAbandoned: 3,
        totalStarted: 15,
        completionRate: 80,
        totalPlayTime: 14400, // 4 hours total playtime
        longestStory: {
          storyId: 'the-haunted-mansion',
          title: 'The Haunted Mansion',
          duration: 'long',
          timeSpent: 1800 // 30 minutes
        },
        shortestStory: {
          storyId: 'midnight-caller',
          title: 'The Midnight Caller',
          duration: 'short',
          timeSpent: 420 // 7 minutes
        },
        favoriteCategory: {
          category: 'Gothic',
          count: 5
        },
        averageRating: 4.2,
        totalRatings: 8,
        streakData: {
          currentStreak: 3,
          longestStreak: 7
        },
        categoryBreakdown: {
          'Gothic': 5,
          'Psychological': 3,
          'Slasher': 2,
          'Supernatural': 2
        },
        durationPreference: {
          'short': 4,
          'medium': 6,
          'long': 2
        },
        recentActivity: [
          {
            storyId: 'the-scalpels-memory',
            title: 'The Scalpel\'s Memory',
            completedAt: '2025-10-22T10:30:00Z',
            rating: 5,
            timeSpent: 1200, // 20 minutes
            status: 'completed'
          },
          {
            storyId: 'whispers-in-the-dark',
            title: 'Whispers in the Dark',
            completedAt: '2025-10-21T15:45:00Z',
            rating: 4,
            timeSpent: 900, // 15 minutes
            status: 'completed'
          },
          {
            storyId: 'the-abandoned-house',
            title: 'The Abandoned House',
            completedAt: '2025-10-20T14:20:00Z',
            timeSpent: 300, // 5 minutes
            status: 'abandoned'
          }
        ]
      };
      
      return res.json(mockStats);
    }

    // Get user's played stories from history
    const historyKey = `user_history:${userId}`;
    const historyJson = await redis.get(historyKey);
    const playedStories = historyJson ? JSON.parse(historyJson) : [];

    // Get user's completed stories
    const completionsKey = getUserCompletionsKey(userId);
    const completionsJson = await redis.get(completionsKey);
    const completedStories = completionsJson ? JSON.parse(completionsJson) : [];

    // Get user's ratings
    const ratingsKey = getUserRatingsKey(userId);
    const ratingsJson = await redis.get(ratingsKey);
    const userRatings = ratingsJson ? JSON.parse(ratingsJson) : {};

    // Get streak data
    const streakKey = getUserStreakKey(userId);
    const streakJson = await redis.get(streakKey);
    const streakData = streakJson ? JSON.parse(streakJson) : { currentStreak: 0, longestStreak: 0 };

    // Get user's play sessions with time data
    const userPlaySessionsKey = `user_play_sessions:${userId}`;
    const sessionsJson = await redis.get(userPlaySessionsKey);
    const playSessions = sessionsJson ? JSON.parse(sessionsJson) : [];

    // Calculate basic stats
    const totalStarted = playedStories.length;
    const totalCompleted = completedStories.length;
    const totalAbandoned = totalStarted - totalCompleted;
    const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

    // Calculate average rating
    const ratings = Object.values(userRatings) as number[];
    const averageRating = ratings.length > 0 ? 
      Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : 0;

    // Calculate total playtime from all sessions
    const totalPlayTime = playSessions.reduce((total: number, session: any) => {
      return total + (session.playTime || 0);
    }, 0);

    // Initialize stats object
    const stats: UserStats = {
      totalCompleted,
      totalAbandoned,
      totalStarted,
      completionRate,
      totalPlayTime,
      longestStory: null,
      shortestStory: null,
      favoriteCategory: null,
      averageRating,
      totalRatings: ratings.length,
      streakData,
      categoryBreakdown: {},
      durationPreference: {},
      recentActivity: []
    };

    // If we have completed stories, get more detailed stats
    if (completedStories.length > 0) {
      // Get story details for analysis
      const storyDetails: Record<string, any> = {};
      
      // Load story metadata for completed stories
      for (const storyId of completedStories.slice(0, 20)) { // Limit to prevent too many Redis calls
        try {
          const storyKey = `story_metadata:${storyId}`;
          const storyJson = await redis.get(storyKey);
          if (storyJson) {
            storyDetails[storyId] = JSON.parse(storyJson);
          }
        } catch (error) {
          console.error(`Error loading story metadata for ${storyId}:`, error);
        }
      }

      // Analyze categories and durations
      const categoryCount: Record<string, number> = {};
      const durationCount: Record<string, number> = {};
      
      for (const [storyId, story] of Object.entries(storyDetails)) {
        if (story.tone) {
          categoryCount[story.tone] = (categoryCount[story.tone] || 0) + 1;
        }
        if (story.duration) {
          durationCount[story.duration] = (durationCount[story.duration] || 0) + 1;
        }
      }

      stats.categoryBreakdown = categoryCount;
      stats.durationPreference = durationCount;

      // Find favorite category
      if (Object.keys(categoryCount).length > 0) {
        const topCategoryEntry = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)[0];
        if (topCategoryEntry) {
          stats.favoriteCategory = {
            category: topCategoryEntry[0],
            count: topCategoryEntry[1]
          };
        }
      }

      // Find longest and shortest stories by actual play time
      const completedSessions = playSessions.filter((session: any) => session.status === 'completed');
      
      if (completedSessions.length > 0) {
        // Find longest play time
        const longestSession = completedSessions.reduce((longest: any, current: any) => 
          current.playTime > longest.playTime ? current : longest
        );
        
        const longestStory = storyDetails[longestSession.storyId];
        if (longestStory) {
          stats.longestStory = {
            storyId: longestSession.storyId,
            title: longestStory.story_title || longestStory.title || 'Unknown Adventure',
            duration: longestStory.duration || 'unknown',
            timeSpent: longestSession.playTime
          };
        }

        // Find shortest play time
        const shortestSession = completedSessions.reduce((shortest: any, current: any) => 
          current.playTime < shortest.playTime ? current : shortest
        );
        
        const shortestStory = storyDetails[shortestSession.storyId];
        if (shortestStory) {
          stats.shortestStory = {
            storyId: shortestSession.storyId,
            title: shortestStory.story_title || shortestStory.title || 'Unknown Adventure',
            duration: shortestStory.duration || 'unknown',
            timeSpent: shortestSession.playTime
          };
        }
      }

      // Get recent activity (last 5 play sessions)
      const recentSessions = playSessions.slice(-5).reverse();
      stats.recentActivity = [];
      
      for (const session of recentSessions) {
        let story = storyDetails[session.storyId];
        
        // If story not in details, try to load it from Redis
        if (!story) {
          try {
            const storyKey = `story:${session.storyId}`;
            const storyJson = await redis.get(storyKey);
            if (storyJson) {
              story = JSON.parse(storyJson);
            }
          } catch (error) {
            console.error(`Error loading story ${session.storyId} for recent activity:`, error);
          }
        }
        
        stats.recentActivity.push({
          storyId: session.storyId,
          title: story?.story_title || story?.title || 'Unknown Adventure',
          completedAt: session.completedAt,
          rating: userRatings[session.storyId],
          timeSpent: session.playTime,
          status: session.status
        });
      }
    }

    console.log(`Returning stats for user ${userId}:`, stats);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
};

// Track story completion with time for stats
export const trackStoryCompletion = async (req: Request, res: Response) => {
  try {
    const { storyId, playTime, status } = req.body;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Tracking story ${status}: ${storyId} for user ${userId}, playTime: ${playTime}s`);

    if (!storyId || !status) {
      return res.status(400).json({ error: 'Story ID and status are required' });
    }

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - mock tracking completion');
      return res.json({ success: true, message: 'Completion tracked (local mock)' });
    }

    // Store user's play session with time tracking
    const userPlaySessionsKey = `user_play_sessions:${userId}`;
    const sessionsJson = await redis.get(userPlaySessionsKey);
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    
    const newSession = {
      storyId,
      playTime: playTime || 0,
      status,
      completedAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    await redis.set(userPlaySessionsKey, JSON.stringify(sessions));

    // If completed, add to completed stories and update streak
    if (status === 'completed') {
      const completionsKey = getUserCompletionsKey(userId);
      const currentCompletionsJson = await redis.get(completionsKey);
      const currentCompletions = currentCompletionsJson ? JSON.parse(currentCompletionsJson) : [];
      
      if (!currentCompletions.includes(storyId)) {
        currentCompletions.push(storyId);
        await redis.set(completionsKey, JSON.stringify(currentCompletions));
      }

      // Update streak
      const streakKey = getUserStreakKey(userId);
      const streakJson = await redis.get(streakKey);
      const streakData = streakJson ? JSON.parse(streakJson) : { currentStreak: 0, longestStreak: 0 };
      
      streakData.currentStreak += 1;
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }
      
      await redis.set(streakKey, JSON.stringify(streakData));

      // Update story completion analytics with time
      const storyCompletionTimesKey = `story_completion_times:${storyId}`;
      const completionTimesJson = await redis.get(storyCompletionTimesKey);
      const completionTimes = completionTimesJson ? JSON.parse(completionTimesJson) : [];
      
      completionTimes.push(playTime || 0);
      await redis.set(storyCompletionTimesKey, JSON.stringify(completionTimes));
    } else if (status === 'abandoned') {
      // Reset streak on abandonment
      const streakKey = getUserStreakKey(userId);
      const streakJson = await redis.get(streakKey);
      const streakData = streakJson ? JSON.parse(streakJson) : { currentStreak: 0, longestStreak: 0 };
      
      streakData.currentStreak = 0;
      await redis.set(streakKey, JSON.stringify(streakData));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking story completion:', error);
    res.status(500).json({ error: 'Failed to track story completion' });
  }
};

// Reset user streak (when they abandon a story)
export const resetUserStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      return res.json({ success: true, message: 'Streak reset (local mock)' });
    }

    const streakKey = getUserStreakKey(userId);
    const streakJson = await redis.get(streakKey);
    const streakData = streakJson ? JSON.parse(streakJson) : { currentStreak: 0, longestStreak: 0 };
    
    streakData.currentStreak = 0;
    await redis.set(streakKey, JSON.stringify(streakData));

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting user streak:', error);
    res.status(500).json({ error: 'Failed to reset user streak' });
  }
};

// Reset ALL user statistics (complete wipe)
export const resetAllUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Resetting ALL statistics for user: ${userId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - mock reset all stats');
      return res.json({ success: true, message: 'All stats reset (local mock)' });
    }

    // Delete all user-related keys
    const keysToDelete = [
      `user_history:${userId}`,           // Play history
      `user_completions:${userId}`,       // Completed stories
      `user_ratings:${userId}`,           // User's ratings
      `user_streak:${userId}`,            // Streak data
      `user_play_sessions:${userId}`,     // Play sessions with time tracking
    ];

    // Delete all keys
    for (const key of keysToDelete) {
      try {
        await redis.del(key);
        console.log(`Deleted key: ${key}`);
      } catch (error) {
        console.error(`Error deleting key ${key}:`, error);
      }
    }

    console.log(`Successfully reset all statistics for user ${userId}`);
    res.json({ 
      success: true, 
      message: 'All user statistics have been permanently deleted',
      deletedKeys: keysToDelete.length
    });
  } catch (error) {
    console.error('Error resetting all user stats:', error);
    res.status(500).json({ error: 'Failed to reset all user statistics' });
  }
};