export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type StoryStatistics = {
  storyId: string;
  totalPlayed: number;
  totalCompleted: number;
  totalAbandoned: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  totalPlayTime: number; // Total time spent by all players in seconds
  averagePlayTime: number; // Average time per completion in seconds
};

export type UserStats = {
  totalCompleted: number;
  totalAbandoned: number;
  totalStarted: number;
  completionRate: number;
  longestStory: {
    storyId: string;
    title: string;
    duration: string;
    timeSpent?: number;
  } | null;
  shortestStory: {
    storyId: string;
    title: string;
    duration: string;
    timeSpent?: number;
  } | null;
  favoriteCategory: {
    category: string;
    count: number;
  } | null;
  averageRating: number;
  totalRatings: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
  };
  categoryBreakdown: Record<string, number>;
  durationPreference: Record<string, number>;
  recentActivity: Array<{
    storyId: string;
    title: string;
    completedAt: string;
    rating?: number;
    timeSpent?: number;
    status: 'completed' | 'abandoned';
  }>;
};

// Helper function to format time duration in seconds to human readable format
export const formatPlayTime = (seconds: number): string => {
  if (seconds < 60) {
    const roundedSeconds = Math.round(seconds);
    return `${roundedSeconds} ${roundedSeconds === 1 ? 'second' : 'seconds'}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};