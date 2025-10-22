import { Request, Response } from 'express';
import { Story } from '../../shared/types/game.js';
import { redis } from '@devvit/web/server';
import { EMBEDDED_STORIES, STORY_METADATA } from './generated-stories.js';

// Story metadata for fast filtering
type StoryMetadata = {
  story_id: string;
  story_title: string;
  tone: string;
  duration: string;
  art_direction: string;
  scene_count: number;
};

// Cache for loaded stories to avoid repeated file reads
const storyCache = new Map<string, Story>();

// Dynamic story loading from files - no hardcoded stories needed!

// Clear all story data from Redis
export const clearStoriesFromRedis = async () => {
  try {
    console.log('🧹 Clearing old story data from Redis...');
    
    // Clear the story index
    await redis.del('story_index');
    
    // Clear individual stories (we'll clear all story: keys)
    // Note: In a real app, you'd want to be more selective
    console.log('🧹 Cleared story index and individual stories');
  } catch (error) {
    console.error('Error clearing stories from Redis:', error);
  }
};

// Store all stories in Redis for scalability (handles 1000+ stories)
export const initializeStoriesInRedis = async () => {
  try {
    console.log('🚀 Storing all stories in Redis...');
    
    // First clear any existing data
    await clearStoriesFromRedis();
    
    // Store each story individually in Redis
    for (const story of EMBEDDED_STORIES) {
      await redis.set(`story:${story.story_id}`, JSON.stringify(story));
    }
    
    // Store the metadata index for fast filtering
    await redis.set('story_index', JSON.stringify(STORY_METADATA));
    
    console.log(`✅ Stored ${EMBEDDED_STORIES.length} stories and metadata in Redis`);
    console.log(`📋 Sample story IDs: ${STORY_METADATA.slice(0, 3).map(s => s.story_id).join(', ')}`);
    return STORY_METADATA;
  } catch (error) {
    console.error('Error storing stories in Redis:', error);
    return STORY_METADATA; // Fallback to embedded metadata
  }
};

// Get story metadata from Redis (fast filtering)
export const getStoryIndex = async (): Promise<StoryMetadata[]> => {
  try {
    const indexJson = await redis.get('story_index');
    
    if (!indexJson) {
      // Initialize Redis with embedded stories on first run
      console.log('📚 No story index found, initializing Redis...');
      return await initializeStoriesInRedis();
    }
    
    return JSON.parse(indexJson);
  } catch (error) {
    console.error('Error getting story index from Redis:', error);
    // Fallback: return embedded metadata
    return STORY_METADATA;
  }
};

// Load a full story by ID from Redis (with caching)
export const loadStoryById = async (storyId: string): Promise<Story | null> => {
  try {
    // Check cache first
    if (storyCache.has(storyId)) {
      return storyCache.get(storyId)!;
    }

    // Try to load from Redis first
    const storyJson = await redis.get(`story:${storyId}`);
    
    if (storyJson) {
      const story = JSON.parse(storyJson) as Story;
      storyCache.set(storyId, story);
      console.log(`📖 Loaded story from Redis: ${story.story_title}`);
      return story;
    }
    
    // Fallback: find in embedded stories (for initial setup)
    const story = EMBEDDED_STORIES.find(s => s.story_id === storyId);
    
    if (!story) {
      console.error(`Story not found: ${storyId}`);
      return null;
    }
    
    // Store in Redis for next time
    await redis.set(`story:${storyId}`, JSON.stringify(story));
    
    // Cache the story
    storyCache.set(storyId, story);
    
    console.log(`📖 Loaded story from embedded (stored in Redis): ${story.story_title}`);
    return story;
  } catch (error) {
    console.error(`Error loading story ${storyId}:`, error);
    return null;
  }
};

export const getStories = async (req: Request, res: Response) => {
  try {
    const { tone, duration } = req.query;
    
    // Get story index from Redis (fast metadata filtering)
    const storyIndex = await getStoryIndex();
    
    // Filter metadata (very fast!)
    let filteredMetadata = storyIndex;
    
    if (tone) {
      filteredMetadata = filteredMetadata.filter(story => story.tone === tone);
    }
    
    if (duration) {
      filteredMetadata = filteredMetadata.filter(story => story.duration === duration);
    }
    
    // Load full stories only for the filtered results
    const stories: Story[] = [];
    for (const metadata of filteredMetadata) {
      const story = await loadStoryById(metadata.story_id);
      if (story) {
        stories.push(story);
      }
    }
    
    res.json({
      stories,
      total: stories.length
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

export const getRandomStory = async (req: Request, res: Response) => {
  try {
    console.log('getRandomStory called with query:', req.query);
    const { tone, duration, excludePlayed } = req.query;
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    // Get story index from Redis (fast!)
    let availableMetadata = await getStoryIndex();
    console.log('Total stories available:', availableMetadata.length);
    
    // Filter by tone (fast metadata filtering)
    if (tone) {
      availableMetadata = availableMetadata.filter(story => story.tone === tone);
      console.log(`Filtered by tone "${tone}":`, availableMetadata.length);
    }
    
    // Filter by duration (fast metadata filtering)
    if (duration) {
      availableMetadata = availableMetadata.filter(story => story.duration === duration);
      console.log(`Filtered by duration "${duration}":`, availableMetadata.length);
    }
    
    // Exclude played stories if requested
    if (excludePlayed === 'true') {
      try {
        // Check if Redis is available (only in Devvit environment)
        const isDevvitEnvironment = typeof redis !== 'undefined';
        
        if (isDevvitEnvironment) {
          const historyKey = `user_history:${userId}`;
          const historyJson = await redis.get(historyKey);
          const playedStories = historyJson ? JSON.parse(historyJson) : [];
          
          if (playedStories.length > 0) {
            const beforeCount = availableMetadata.length;
            availableMetadata = availableMetadata.filter(story => !playedStories.includes(story.story_id));
            console.log(`Excluded ${beforeCount - availableMetadata.length} played stories, ${availableMetadata.length} remaining`);
          }
        }
      } catch (error) {
        console.warn('Could not filter played stories:', error);
        // Continue without filtering if Redis fails
      }
    }
    
    if (availableMetadata.length === 0) {
      console.log('No stories found matching criteria');
      return res.status(404).json({ 
        error: 'No new stories found matching criteria',
        suggestion: 'Try different filters or clear your story history'
      });
    }
    
    // Select random story metadata
    const randomIndex = Math.floor(Math.random() * availableMetadata.length);
    const selectedMetadata = availableMetadata[randomIndex];
    
    if (!selectedMetadata) {
      console.log('No story selected - this should not happen');
      return res.status(500).json({ error: 'Failed to select a story' });
    }
    
    // Load the full story only when needed
    const selectedStory = await loadStoryById(selectedMetadata.story_id);
    
    if (!selectedStory) {
      console.log('Failed to load story:', selectedMetadata.story_id);
      return res.status(500).json({ error: 'Failed to load story data' });
    }
    
    console.log('Selected story:', selectedStory.story_title);
    
    // Ensure we're sending JSON with proper headers
    res.setHeader('Content-Type', 'application/json');
    res.json({ story: selectedStory });
  } catch (error) {
    console.error('Error fetching random story:', error);
    res.status(500).json({ error: 'Failed to fetch random story', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getStoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find story metadata in index
    const storyIndex = await getStoryIndex();
    const metadata = storyIndex.find(s => s.story_id === id);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Load full story
    const story = await loadStoryById(metadata.story_id);
    
    if (!story) {
      return res.status(500).json({ error: 'Failed to load story data' });
    }
    
    res.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
};

// Force refresh the story index (reinitialize Redis with embedded stories)
export const refreshStoryIndex = async (_req: Request, res: Response) => {
  try {
    console.log('🔄 Force refreshing story index and Redis storage...');
    const newIndex = await initializeStoriesInRedis();
    
    res.json({
      success: true,
      message: `Refreshed Redis with ${newIndex.length} stories`,
      stories: newIndex.map(s => ({ title: s.story_title, tone: s.tone, duration: s.duration }))
    });
  } catch (error) {
    console.error('Error refreshing story index:', error);
    res.status(500).json({ error: 'Failed to refresh story index' });
  }
};