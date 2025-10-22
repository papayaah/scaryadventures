import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';

export type RatingType = 'like' | 'dislike';

export type RatingData = {
  likes: number;
  dislikes: number;
  userRating?: RatingType;
};

// Helper function to get Redis key for a story
const getStoryRatingKey = (storyId: string) => `story_ratings:${storyId}`;
const getUserRatingKey = (storyId: string, userId: string) => `user_rating:${storyId}:${userId}`;

// Get ratings for a story
export const getStoryRatings = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Getting ratings for story: ${storyId}, user: ${userId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback - return mock data
      return res.json({
        likes: Math.floor(Math.random() * 50) + 10,
        dislikes: Math.floor(Math.random() * 10) + 2,
        userRating: undefined
      });
    }

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    const ratingKey = getStoryRatingKey(storyId);
    const userRatingKey = getUserRatingKey(storyId, userId);

    // Get story ratings and user's rating in parallel
    const [storyRatings, userRating] = await Promise.all([
      redis.hGetAll(ratingKey),
      redis.get(userRatingKey)
    ]);

    const likes = parseInt(storyRatings.likes || '0');
    const dislikes = parseInt(storyRatings.dislikes || '0');

    res.json({
      likes,
      dislikes,
      userRating: userRating as RatingType | undefined
    });
  } catch (error) {
    console.error('Error getting story ratings:', error);
    res.status(500).json({ error: 'Failed to get story ratings' });
  }
};

// Rate a story (like or dislike)
export const rateStory = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const { rating } = req.body as { rating: RatingType };
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Rating story ${storyId} as ${rating} by user ${userId}`);

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    if (!rating || !['like', 'dislike'].includes(rating)) {
      return res.status(400).json({ error: 'Invalid rating. Must be "like" or "dislike"' });
    }

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback - return mock success
      return res.json({
        success: true,
        message: 'Rating saved (local mock)',
        likes: Math.floor(Math.random() * 50) + 10,
        dislikes: Math.floor(Math.random() * 10) + 2,
        userRating: rating
      });
    }

    const ratingKey = getStoryRatingKey(storyId);
    const userRatingKey = getUserRatingKey(storyId, userId);

    // Get user's previous rating
    const previousRating = await redis.get(userRatingKey) as RatingType | null;

    // Remove previous rating if it exists
    if (previousRating) {
      if (previousRating === 'like') {
        await redis.hIncrBy(ratingKey, 'likes', -1);
      } else {
        await redis.hIncrBy(ratingKey, 'dislikes', -1);
      }
    }

    // Add new rating
    if (rating === 'like') {
      await redis.hIncrBy(ratingKey, 'likes', 1);
    } else {
      await redis.hIncrBy(ratingKey, 'dislikes', 1);
    }

    // Set user's new rating
    await redis.set(userRatingKey, rating);

    // Get updated ratings
    const updatedRatings = await redis.hGetAll(ratingKey);
    const likes = parseInt(updatedRatings.likes || '0');
    const dislikes = parseInt(updatedRatings.dislikes || '0');

    res.json({
      success: true,
      likes,
      dislikes,
      userRating: rating
    });
  } catch (error) {
    console.error('Error rating story:', error);
    res.status(500).json({ error: 'Failed to rate story' });
  }
};

// Remove a user's rating
export const removeRating = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.params;
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    console.log(`Removing rating for story ${storyId} by user ${userId}`);

    if (!storyId) {
      return res.status(400).json({ error: 'Story ID is required' });
    }

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({
        success: true,
        message: 'Rating removed (local mock)',
        likes: Math.floor(Math.random() * 50) + 10,
        dislikes: Math.floor(Math.random() * 10) + 2,
        userRating: undefined
      });
    }

    const ratingKey = getStoryRatingKey(storyId);
    const userRatingKey = getUserRatingKey(storyId, userId);

    // Get user's current rating
    const currentRating = await redis.get(userRatingKey) as RatingType | null;

    if (!currentRating) {
      return res.status(404).json({ error: 'No rating found to remove' });
    }

    // Remove the rating count
    if (currentRating === 'like') {
      await redis.hIncrBy(ratingKey, 'likes', -1);
    } else {
      await redis.hIncrBy(ratingKey, 'dislikes', -1);
    }

    // Remove user's rating
    await redis.del(userRatingKey);

    // Get updated ratings
    const updatedRatings = await redis.hGetAll(ratingKey);
    const likes = parseInt(updatedRatings.likes || '0');
    const dislikes = parseInt(updatedRatings.dislikes || '0');

    res.json({
      success: true,
      likes,
      dislikes,
      userRating: undefined
    });
  } catch (error) {
    console.error('Error removing rating:', error);
    res.status(500).json({ error: 'Failed to remove rating' });
  }
};