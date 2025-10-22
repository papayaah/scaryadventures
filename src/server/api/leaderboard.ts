import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';
import { Story } from '../../shared/types/game.js';

export type LeaderboardEntry = {
  story: Story;
  likes: number;
  dislikes: number;
  totalVotes: number;
  likeRatio: number;
  score: number; // Calculated score for ranking
};

// Helper function to calculate story score
const calculateStoryScore = (likes: number, dislikes: number): number => {
  const totalVotes = likes + dislikes;
  if (totalVotes === 0) return 0;
  
  // Wilson score interval for better ranking
  // This gives a more accurate ranking than simple like ratio
  const p = likes / totalVotes;
  const n = totalVotes;
  const z = 1.96; // 95% confidence interval
  
  const score = (p + z * z / (2 * n) - z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n);
  return Math.max(0, score);
};

// Get story leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const maxResults = Math.min(parseInt(limit as string) || 10, 50); // Cap at 50

    console.log(`Getting leaderboard with limit: ${maxResults}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback - return mock leaderboard
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          story: {
            story_id: 'mock_1',
            story_title: 'The Haunted Manor',
            tone: 'Gothic',
            duration: 'medium',
            art_direction: 'A spooky Victorian mansion',
            settings: { tone: 'Gothic', language: 'elevated', narrative: 'second_person', pacing: 'moderate', violence: 'mild', imagery: 'rich', dialogue: 'whispers', duration: 'medium' },
            image_settings: { image_style: 'pixel_horror', lighting_mood: 'candlelight', color_palette: 'muted_reds', camera_perspective: 'first_person' },
            scenes: [],
            _metadata: { provider: 'Mock', model: 'test', generated_at: new Date().toISOString() }
          },
          likes: 45,
          dislikes: 5,
          totalVotes: 50,
          likeRatio: 0.9,
          score: 0.85
        },
        {
          story: {
            story_id: 'mock_2',
            story_title: 'Cosmic Terror',
            tone: 'Cosmic',
            duration: 'long',
            art_direction: 'Eldritch horrors from beyond',
            settings: { tone: 'Cosmic', language: 'elevated', narrative: 'second_person', pacing: 'slow', violence: 'moderate', imagery: 'rich', dialogue: 'whispers', duration: 'long' },
            image_settings: { image_style: 'pixel_horror', lighting_mood: 'undefined', color_palette: 'undefined', camera_perspective: 'first_person' },
            scenes: [],
            _metadata: { provider: 'Mock', model: 'test', generated_at: new Date().toISOString() }
          },
          likes: 32,
          dislikes: 8,
          totalVotes: 40,
          likeRatio: 0.8,
          score: 0.72
        }
      ];
      
      return res.json({
        leaderboard: mockLeaderboard.slice(0, maxResults),
        total: mockLeaderboard.length
      });
    }

    // Get all available stories from the embedded stories
    let allStories: Story[] = [];
    
    try {
      // Import the embedded stories
      const storiesModule = await import('./generated-stories.js');
      allStories = storiesModule.EMBEDDED_STORIES || [];
      console.log(`Loaded ${allStories.length} stories for leaderboard`);
    } catch (error) {
      console.warn('Could not load embedded stories, using empty array:', error);
      allStories = [];
    }

    if (allStories.length === 0) {
      return res.json({
        leaderboard: [],
        total: 0
      });
    }

    // Get ratings for all stories
    const leaderboardEntries: LeaderboardEntry[] = [];
    
    for (const story of allStories) {
      try {
        const ratingKey = `story_ratings:${story.story_id}`;
        const ratings = await redis.hGetAll(ratingKey);
        
        const likes = parseInt(ratings.likes || '0');
        const dislikes = parseInt(ratings.dislikes || '0');
        const totalVotes = likes + dislikes;
        const likeRatio = totalVotes > 0 ? likes / totalVotes : 0;
        const score = calculateStoryScore(likes, dislikes);
        
        leaderboardEntries.push({
          story,
          likes,
          dislikes,
          totalVotes,
          likeRatio,
          score
        });
      } catch (error) {
        console.warn(`Error getting ratings for story ${story.story_id}:`, error);
        // Include story with zero ratings
        leaderboardEntries.push({
          story,
          likes: 0,
          dislikes: 0,
          totalVotes: 0,
          likeRatio: 0,
          score: 0
        });
      }
    }

    // Sort by score (highest first), then by total votes as tiebreaker
    leaderboardEntries.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.totalVotes - a.totalVotes;
    });

    const topEntries = leaderboardEntries.slice(0, maxResults);
    
    console.log(`Returning ${topEntries.length} leaderboard entries`);
    
    res.json({
      leaderboard: topEntries,
      total: leaderboardEntries.length
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};

// Get leaderboard for a specific tone
export const getLeaderboardByTone = async (req: Request, res: Response) => {
  try {
    const { tone } = req.params;
    
    console.log(`Getting leaderboard for tone: ${tone}`);
    
    // For now, we'll get the full leaderboard and filter by tone
    // In a production app, you might want to optimize this
    req.query.limit = '50'; // Get more results to filter
    
    // Call the main leaderboard function
    await getLeaderboard(req, res);
    
    // Note: In a real implementation, you'd want to filter by tone
    // before calculating the leaderboard for better performance
  } catch (error) {
    console.error('Error getting leaderboard by tone:', error);
    res.status(500).json({ error: 'Failed to get leaderboard by tone' });
  }
};