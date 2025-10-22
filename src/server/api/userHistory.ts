import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';

export type UserStoryHistory = {
  playedStories: string[];
  totalPlayed: number;
};

// Helper function to get Redis key for user's story history
const getUserHistoryKey = (userId: string) => `user_history:${userId}`;

// Get user's story history
export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Getting user history for user: ${userId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - returning mock history');
      // Local development fallback - return mock data
      return res.json({
        playedStories: [],
        totalPlayed: 0
      });
    }

    const historyKey = getUserHistoryKey(userId);
    console.log(`Using Redis key: ${historyKey}`);
    
    // Get user's played stories (stored as JSON string)
    const historyJson = await redis.get(historyKey);
    const playedStories = historyJson ? JSON.parse(historyJson) : [];
    console.log(`Found ${playedStories.length} played stories:`, playedStories);
    
    res.json({
      playedStories,
      totalPlayed: playedStories.length
    });
  } catch (error) {
    console.error('Error getting user history:', error);
    res.status(500).json({ error: 'Failed to get user history' });
  }
};

// Add a story to user's history
export const addStoryToHistory = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.body;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Adding story ${storyId} to history for user ${userId}`);

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      console.log('Local development - mock adding story to history');
      // Local development fallback
      return res.json({
        success: true,
        message: 'Story added to history (local mock)',
        playedStories: [storyId],
        totalPlayed: 1
      });
    }

    const historyKey = getUserHistoryKey(userId);
    console.log(`Using Redis key: ${historyKey}`);
    
    // Get current history
    const currentHistoryJson = await redis.get(historyKey);
    const currentHistory = currentHistoryJson ? JSON.parse(currentHistoryJson) : [];
    
    // Add story if not already present
    if (!currentHistory.includes(storyId)) {
      currentHistory.push(storyId);
      await redis.set(historyKey, JSON.stringify(currentHistory));
      console.log(`Added story ${storyId} to history`);
    } else {
      console.log(`Story ${storyId} already in history`);
    }
    
    console.log(`Updated history has ${currentHistory.length} stories:`, currentHistory);
    const playedStories = currentHistory;
    
    res.json({
      success: true,
      playedStories,
      totalPlayed: playedStories.length
    });
  } catch (error) {
    console.error('Error adding story to history:', error);
    res.status(500).json({ error: 'Failed to add story to history' });
  }
};

// Clear user's story history (for testing or user request)
export const clearUserHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({
        success: true,
        message: 'History cleared (local mock)',
        playedStories: [],
        totalPlayed: 0
      });
    }

    const historyKey = getUserHistoryKey(userId);
    
    // Delete the user's history
    await redis.del(historyKey);
    
    res.json({
      success: true,
      playedStories: [],
      totalPlayed: 0
    });
  } catch (error) {
    console.error('Error clearing user history:', error);
    res.status(500).json({ error: 'Failed to clear user history' });
  }
};