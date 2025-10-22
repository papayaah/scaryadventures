import { useState, useCallback, useEffect } from 'react';
import { Story, Tone, Duration, GameState } from '../../shared/types/game';

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
        const errorText = await response.text();
        throw new Error(`Failed to fetch random story: ${response.status} - ${errorText}`);
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

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: story.tone,
        selectedDuration: story.duration,
      });
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
        const errorText = await response.text();
        throw new Error(`Failed to fetch story with specified criteria: ${response.status} - ${errorText}`);
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

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: tone,
        selectedDuration: duration,
      });
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

      // Add story to user's history
      await addStoryToHistory(story.story_id);

      setGameState({
        currentStory: story,
        currentScene: story.scenes[0] || null,
        gameStarted: true,
        selectedTone: story.tone,
        selectedDuration: story.duration,
      });
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
  };
};