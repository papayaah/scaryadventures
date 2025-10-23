import { useState, useCallback, useEffect } from 'react';
import { Story, Tone, Duration, GameState } from '../../shared/types/game';



// Helper function to construct image path
const getSceneImagePath = (story: Story, scene: any): string => {
  // Use the story's filename (without .json extension) as the folder name
  const folderName = story.filename ? story.filename.replace('.json', '') : 'default';
  
  // Check if scene has a custom image filename
  if (scene.image_filename) {
    return `/assets/scenes/${folderName}/${scene.image_filename}`;
  }
  
  // Default to .jpg extension
  return `/assets/scenes/${folderName}/${scene.id}.jpg`;
};

// Helper function to preload the first scene image
const preloadFirstSceneImage = (story: Story): Promise<void> => {
  return new Promise((resolve) => {
    if (!story.scenes || story.scenes.length === 0) {
      resolve();
      return;
    }

    const firstScene = story.scenes[0];
    const imagePath = getSceneImagePath(story, firstScene);
    const preloadImage = new Image();
    
    preloadImage.onload = () => resolve();
    preloadImage.onerror = () => resolve(); // Resolve even on error to not block the game
    preloadImage.src = imagePath;
  });
};

type UserInfo = {
  userId: string;
  username: string;
  isAuthenticated: boolean;
};

type UserHistory = {
  playedStories: string[];
  totalPlayed: number;
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentStory: null,
    currentScene: null,
    gameStarted: false,
    selectedTone: undefined,
    selectedDuration: undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistory>({ playedStories: [], totalPlayed: 0 });
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Load user info and history on mount
  useEffect(() => {
    loadUserInfo();
    loadUserHistory();
  }, []);

  const loadUserInfo = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const loadUserHistory = async () => {
    try {
      const response = await fetch('/api/user/history');
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data);
      }
    } catch (error) {
      console.error('Failed to load user history:', error);
    }
  };

  const addStoryToHistory = async (storyId: string) => {
    try {
      const response = await fetch('/api/user/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserHistory({
          playedStories: data.playedStories,
          totalPlayed: data.totalPlayed
        });
      }
    } catch (error) {
      console.error('Failed to add story to history:', error);
    }
  };

  const startRandomGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get a story that hasn't been played yet
      const excludePlayed = userHistory.totalPlayed > 0 ? 'true' : 'false';
      const response = await fetch(`/api/stories/random?excludePlayed=${excludePlayed}`);
      
      if (!response.ok) {
        let errorMessage = 'Unable to find a story';
        
        try {
          const errorData = await response.json();
          if (response.status === 404 && errorData.error === "No new stories found matching criteria") {
            errorMessage = "You've experienced all available stories! Reset your history to replay adventures.";
          }
        } catch {
          // If we can't parse the error, use a generic message
          errorMessage = 'Unable to find a new story. Try resetting your story history to replay adventures.';
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
      }

      const data = await response.json();
      
      if (!data.story) {
        throw new Error('No story data received from server');
      }

      const story: Story = data.story;

      if (!story.scenes || story.scenes.length === 0) {
        throw new Error('Story has no scenes');
      }

      // Preload the first scene image while still showing loading screen
      await preloadFirstSceneImage(story);

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      // Track story start for analytics
      try {
        await fetch('/api/analytics/story-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId: story.story_id,
            tone: story.tone,
            duration: story.duration
          })
        });
      } catch (error) {
        console.error('Failed to track story start:', error);
      }

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: story.tone,
        selectedDuration: story.duration,
      });
      setGameStartTime(Date.now());
    } catch (err) {
      console.error('Error starting random game:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userHistory.totalPlayed, addStoryToHistory]);

  const startCustomGame = useCallback(async (tone?: Tone, duration?: Duration) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (tone) params.append('tone', tone);
      if (duration) params.append('duration', duration);
      
      // Try to exclude played stories
      const excludePlayed = userHistory.totalPlayed > 0 ? 'true' : 'false';
      params.append('excludePlayed', excludePlayed);

      const response = await fetch(`/api/stories/random?${params.toString()}`);
      
      if (!response.ok) {
        let errorMessage = 'Unable to find a story';
        
        try {
          const errorData = await response.json();
          if (response.status === 404 && errorData.error === "No new stories found matching criteria") {
            // Create a friendly message based on the selected criteria
            const criteriaText = [];
            if (tone) criteriaText.push(`${tone} category`);
            if (duration) criteriaText.push(`${duration} length`);
            
            if (criteriaText.length > 0) {
              errorMessage = `No new ${criteriaText.join(' and ')} stories available. Try different settings or reset your story history to replay adventures.`;
            } else {
              errorMessage = "You've experienced all available stories! Reset your history to replay adventures.";
            }
          }
        } catch {
          // If we can't parse the error, use a generic message
          errorMessage = 'Unable to find a story that matches your preferences. Try different settings or reset your story history.';
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${contentType}. Response: ${responseText.substring(0, 200)}...`);
      }

      const data = await response.json();
      
      if (!data.story) {
        throw new Error('No story data received from server');
      }

      const story: Story = data.story;

      if (!story.scenes || story.scenes.length === 0) {
        throw new Error('Story has no scenes');
      }

      // Preload the first scene image while still showing loading screen
      await preloadFirstSceneImage(story);

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      // Track story start for analytics
      try {
        await fetch('/api/analytics/story-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId: story.story_id,
            tone: tone || story.tone,
            duration: duration || story.duration
          })
        });
      } catch (error) {
        console.error('Failed to track story start:', error);
      }

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: tone,
        selectedDuration: duration,
      });
      setGameStartTime(Date.now());
    } catch (err) {
      console.error('Error starting custom game:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userHistory.totalPlayed, addStoryToHistory]);

  const endGame = useCallback(() => {
    setGameState({
      currentStory: null,
      currentScene: null,
      gameStarted: false,
      selectedTone: undefined,
      selectedDuration: undefined,
    });
    setGameStartTime(null);
    setError(null);
  }, []);

  const startGame = useCallback(async (tone?: Tone, duration?: Duration) => {
    if (tone || duration) {
      await startCustomGame(tone, duration);
    } else {
      await startRandomGame();
    }
  }, [startCustomGame, startRandomGame]);

  const playSpecificStory = useCallback(async (story: Story) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!story.scenes || story.scenes.length === 0) {
        throw new Error('Story has no scenes');
      }

      // Preload the first scene image while still showing loading screen
      await preloadFirstSceneImage(story);

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      // Track story start for analytics
      try {
        await fetch('/api/analytics/story-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storyId: story.story_id,
            tone: story.tone,
            duration: story.duration
          })
        });
      } catch (error) {
        console.error('Failed to track story start:', error);
      }

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: story.tone,
        selectedDuration: story.duration,
      });
      setGameStartTime(Date.now());
    } catch (err) {
      console.error('Error starting specific story:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [addStoryToHistory]);

  const clearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/user/history', {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setUserHistory({
          playedStories: data.playedStories,
          totalPlayed: data.totalPlayed
        });
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }, []);

  const trackStoryCompletion = useCallback(async (storyId: string) => {
    if (!gameStartTime) return;
    
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000); // Convert to seconds
    
    try {
      await fetch('/api/user/track-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storyId,
          playTime,
          status: 'completed'
        })
      });
    } catch (error) {
      console.error('Failed to track story completion:', error);
    }
  }, [gameStartTime]);

  const trackStoryAbandonment = useCallback(async (storyId: string) => {
    if (!gameStartTime) return;
    
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000); // Convert to seconds
    
    try {
      await fetch('/api/user/track-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storyId,
          playTime,
          status: 'abandoned'
        })
      });
    } catch (error) {
      console.error('Failed to track story abandonment:', error);
    }
  }, [gameStartTime]);

  return {
    gameState,
    isLoading,
    error,
    userInfo,
    userHistory,
    startGame,
    playSpecificStory,
    endGame,
    clearHistory,
    trackStoryCompletion,
    trackStoryAbandonment,
  };
};