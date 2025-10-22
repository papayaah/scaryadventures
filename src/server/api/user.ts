import { Request, Response } from 'express';
import { reddit } from '@devvit/web/server';

export type UserInfo = {
  userId: string;
  username: string;
  isAuthenticated: boolean;
};

// Get current user information
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Check if we're in Devvit environment
    const isDevvitEnvironment = typeof reddit !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback - return mock user
      const mockUserId = `local_user_${Date.now()}`;
      console.log('Local development - returning mock user:', mockUserId);
      return res.json({
        userId: mockUserId,
        username: 'LocalPlayer',
        isAuthenticated: false
      });
    }

    try {
      // Get Reddit user info
      const username = await reddit.getCurrentUsername();
      const userId = username || 'anonymous';
      
      console.log('Devvit user info - Username:', username, 'UserId:', userId);
      
      res.json({
        userId,
        username,
        isAuthenticated: !!username
      });
    } catch (error) {
      console.log('Failed to get Reddit username, using anonymous:', error);
      // Fallback for unauthenticated users
      res.json({
        userId: 'anonymous',
        username: 'Anonymous',
        isAuthenticated: false
      });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};