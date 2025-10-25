import { Request, Response } from 'express';
import { redis } from '@devvit/web/server';

export const trackStoryStart = async (req: Request, res: Response) => {
  try {
    const { storyId, tone, duration } = req.body;

    console.log(`Tracking story start: ${storyId}, tone: ${tone}, duration: ${duration}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';

    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({ success: true, message: 'Analytics tracked (local mock)' });
    }

    // Get subreddit context for community-specific tracking
    const subredditName = req.headers['x-subreddit-name'] as string || 'unknown';

    // Track GLOBAL analytics (across all communities)
    await redis.incrBy(`analytics:global:story:${storyId}:started`, 1);
    await redis.incrBy('analytics:global:total:started', 1);

    // Track COMMUNITY-SPECIFIC analytics
    await redis.incrBy(`analytics:${subredditName}:story:${storyId}:started`, 1);
    await redis.incrBy(`analytics:${subredditName}:total:started`, 1);

    // Track tone preference (both global and community)
    if (tone) {
      await redis.incrBy(`analytics:global:tone:${tone}`, 1);
      await redis.incrBy(`analytics:${subredditName}:tone:${tone}`, 1);
    }

    // Track duration preference (both global and community)
    if (duration) {
      await redis.incrBy(`analytics:global:duration:${duration}`, 1);
      await redis.incrBy(`analytics:${subredditName}:duration:${duration}`, 1);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking story start:', error);
    res.status(500).json({ error: 'Failed to track story start' });
  }
};

export const trackStoryComplete = async (req: Request, res: Response) => {
  try {
    const { storyId } = req.body;

    console.log(`Tracking story completion: ${storyId}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';

    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({ success: true, message: 'Analytics tracked (local mock)' });
    }

    // Get subreddit context for community-specific tracking
    const subredditName = req.headers['x-subreddit-name'] as string || 'unknown';

    // Track GLOBAL completion
    await redis.incrBy(`analytics:global:story:${storyId}:completed`, 1);
    await redis.incrBy('analytics:global:total:completed', 1);

    // Track COMMUNITY-SPECIFIC completion
    await redis.incrBy(`analytics:${subredditName}:story:${storyId}:completed`, 1);
    await redis.incrBy(`analytics:${subredditName}:total:completed`, 1);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking story completion:', error);
    res.status(500).json({ error: 'Failed to track story completion' });
  }
};

// Track scene views
export const trackSceneView = async (req: Request, res: Response) => {
  try {
    const { storyId, sceneId } = req.body;
    
    console.log(`Tracking scene view: ${storyId}/${sceneId}`);
    
    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({ success: true, message: 'Scene view tracked (local mock)' });
    }

    // Get subreddit context for community-specific tracking
    const subredditName = req.headers['x-subreddit-name'] as string || 'unknown';
    
    // Track GLOBAL scene views
    await redis.incrBy('analytics:global:total:scenes', 1);
    await redis.incrBy(`analytics:global:story:${storyId}:scenes`, 1);
    
    // Track COMMUNITY-SPECIFIC scene views
    await redis.incrBy(`analytics:${subredditName}:total:scenes`, 1);
    await redis.incrBy(`analytics:${subredditName}:story:${storyId}:scenes`, 1);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking scene view:', error);
    res.status(500).json({ error: 'Failed to track scene view' });
  }
};

// Track playtime for any story session (completed or abandoned)
export const trackStoryPlaytime = async (req: Request, res: Response) => {
  try {
    const { storyId, playTime, status } = req.body;

    console.log(`Tracking story playtime: ${storyId}, time: ${playTime}s, status: ${status}`);

    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';

    if (!isDevvitEnvironment) {
      // Local development fallback
      return res.json({ success: true, message: 'Playtime tracked (local mock)' });
    }

    if (!storyId || playTime === undefined) {
      return res.status(400).json({ error: 'Story ID and play time are required' });
    }

    // Get subreddit context for community-specific tracking
    const subredditName = req.headers['x-subreddit-name'] as string || 'unknown';

    // Track ALL playtime for this story (completed + abandoned) - GLOBAL
    const globalStoryPlayTimeKey = `analytics:global:story_all_playtime:${storyId}`;
    const globalPlayTimesJson = await redis.get(globalStoryPlayTimeKey);
    const globalPlayTimes = globalPlayTimesJson ? JSON.parse(globalPlayTimesJson) : [];
    globalPlayTimes.push(playTime);
    await redis.set(globalStoryPlayTimeKey, JSON.stringify(globalPlayTimes));

    // Track ALL playtime for this story (completed + abandoned) - COMMUNITY
    const communityStoryPlayTimeKey = `analytics:${subredditName}:story_all_playtime:${storyId}`;
    const communityPlayTimesJson = await redis.get(communityStoryPlayTimeKey);
    const communityPlayTimes = communityPlayTimesJson ? JSON.parse(communityPlayTimesJson) : [];
    communityPlayTimes.push(playTime);
    await redis.set(communityStoryPlayTimeKey, JSON.stringify(communityPlayTimes));

    // Track TOTAL playtime across ALL stories - GLOBAL
    await redis.incrBy('analytics:global:total:playtime', Math.round(playTime));

    // Track TOTAL playtime across ALL stories - COMMUNITY
    await redis.incrBy(`analytics:${subredditName}:total:playtime`, Math.round(playTime));

    // Also track completion times separately (for backwards compatibility)
    if (status === 'completed') {
      const globalCompletionTimesKey = `analytics:global:story_completion_times:${storyId}`;
      const globalCompletionTimesJson = await redis.get(globalCompletionTimesKey);
      const globalCompletionTimes = globalCompletionTimesJson ? JSON.parse(globalCompletionTimesJson) : [];
      globalCompletionTimes.push(playTime);
      await redis.set(globalCompletionTimesKey, JSON.stringify(globalCompletionTimes));

      const communityCompletionTimesKey = `analytics:${subredditName}:story_completion_times:${storyId}`;
      const communityCompletionTimesJson = await redis.get(communityCompletionTimesKey);
      const communityCompletionTimes = communityCompletionTimesJson ? JSON.parse(communityCompletionTimesJson) : [];
      communityCompletionTimes.push(playTime);
      await redis.set(communityCompletionTimesKey, JSON.stringify(communityCompletionTimes));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking story playtime:', error);
    res.status(500).json({ error: 'Failed to track story playtime' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';

    if (!isDevvitEnvironment) {
      // Local development fallback - return mock analytics
      return res.json({
        showForm: {
          name: 'analyticsDisplay',
          form: {
            title: 'Scary Adventures Analytics Dashboard',
            description: 'Game performance and user preferences',
            fields: [
              {
                type: 'paragraph',
                name: 'analytics',
                label: 'Analytics Data',
                disabled: true,
                lineHeight: 20,
                defaultValue: 'Local Development - Mock Analytics\n\nCommunity Stats:\nTotal Games Started: 25\nTotal Games Completed: 20\nTotal Playtime: 8h 30m\n\nGlobal Stats:\nTotal Games Started: 150\nTotal Games Completed: 120\nTotal Playtime: 45h 15m'
              }
            ],
            acceptLabel: 'Close'
          }
        }
      });
    }

    // Get subreddit context
    const subredditName = req.headers['x-subreddit-name'] as string || 'unknown';

    // Helper function to format seconds to human readable time
    const formatPlayTime = (seconds: number): string => {
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
    };

    // Get COMMUNITY analytics
    const communityStats: Record<string, string> = {};
    const communityKeys = [
      `analytics:${subredditName}:total:started`,
      `analytics:${subredditName}:total:completed`,
      `analytics:${subredditName}:total:playtime`,
      `analytics:${subredditName}:total:scenes`
    ];

    // Get tone analytics for community
    const tones = ['Gothic', 'Slasher', 'Psychological', 'Cosmic', 'Folk', 'Supernatural', 'Occult', 'Body Horror', 'Surreal', 'Noir Horror'];
    for (const tone of tones) {
      communityKeys.push(`analytics:${subredditName}:tone:${tone}`);
    }

    // Get duration analytics for community
    const durations = ['short', 'medium', 'long'];
    for (const duration of durations) {
      communityKeys.push(`analytics:${subredditName}:duration:${duration}`);
    }

    // Get all community analytics data
    for (const key of communityKeys) {
      const value = await redis.get(key);
      communityStats[key] = value || "0";
    }

    // Get GLOBAL analytics
    const globalStats: Record<string, string> = {};
    const globalKeys = [
      'analytics:global:total:started',
      'analytics:global:total:completed',
      'analytics:global:total:playtime',
      'analytics:global:total:scenes'
    ];

    // Get tone analytics for global
    for (const tone of tones) {
      globalKeys.push(`analytics:global:tone:${tone}`);
    }

    // Get duration analytics for global
    for (const duration of durations) {
      globalKeys.push(`analytics:global:duration:${duration}`);
    }

    // Get all global analytics data
    for (const key of globalKeys) {
      const value = await redis.get(key);
      globalStats[key] = value || "0";
    }

    // Build community summary
    const communityStarted = parseInt(communityStats[`analytics:${subredditName}:total:started`] || '0');
    const communityCompleted = parseInt(communityStats[`analytics:${subredditName}:total:completed`] || '0');
    const communityPlaytime = parseInt(communityStats[`analytics:${subredditName}:total:playtime`] || '0');
    const communityScenes = parseInt(communityStats[`analytics:${subredditName}:total:scenes`] || '0');
    const communityCompletionRate = communityStarted > 0 ? Math.round((communityCompleted / communityStarted) * 100) : 0;

    // Build global summary
    const globalStarted = parseInt(globalStats['analytics:global:total:started'] || '0');
    const globalCompleted = parseInt(globalStats['analytics:global:total:completed'] || '0');
    const globalPlaytime = parseInt(globalStats['analytics:global:total:playtime'] || '0');
    const globalScenes = parseInt(globalStats['analytics:global:total:scenes'] || '0');
    const globalCompletionRate = globalStarted > 0 ? Math.round((globalCompleted / globalStarted) * 100) : 0;

    // Format analytics data for display
    const analyticsText = [
      `COMMUNITY ANALYTICS (r/${subredditName})`,
      `Total Games Started: ${communityStarted}`,
      `Total Games Completed: ${communityCompleted}`,
      `Completion Rate: ${communityCompletionRate}%`,
      `Total Scenes Viewed: ${communityScenes}`,
      `Total Playtime: ${formatPlayTime(communityPlaytime)}`,
      '',
      'Popular Categories:',
      ...tones.map(tone => {
        const count = communityStats[`analytics:${subredditName}:tone:${tone}`] || '0';
        return count !== '0' ? `  ${tone}: ${count}` : null;
      }).filter(Boolean),
      '',
      'Duration Preferences:',
      ...durations.map(duration => {
        const count = communityStats[`analytics:${subredditName}:duration:${duration}`] || '0';
        return count !== '0' ? `  ${duration.charAt(0).toUpperCase() + duration.slice(1)}: ${count}` : null;
      }).filter(Boolean),
      '',
      'GLOBAL ANALYTICS (All Communities)',
      `Total Games Started: ${globalStarted}`,
      `Total Games Completed: ${globalCompleted}`,
      `Completion Rate: ${globalCompletionRate}%`,
      `Total Scenes Viewed: ${globalScenes}`,
      `Total Playtime: ${formatPlayTime(globalPlaytime)}`,
      '',
      'Popular Categories (Global):',
      ...tones.map(tone => {
        const count = globalStats[`analytics:global:tone:${tone}`] || '0';
        return count !== '0' ? `  ${tone}: ${count}` : null;
      }).filter(Boolean),
      '',
      'Duration Preferences (Global):',
      ...durations.map(duration => {
        const count = globalStats[`analytics:global:duration:${duration}`] || '0';
        return count !== '0' ? `  ${duration.charAt(0).toUpperCase() + duration.slice(1)}: ${count}` : null;
      }).filter(Boolean)
    ].filter(line => line !== null).join('\n');

    console.log('=== SCARY ADVENTURES ANALYTICS ===');
    console.log(analyticsText);
    console.log('=== END ANALYTICS ===');

    // Return a form that displays both community and global analytics
    res.json({
      showForm: {
        name: 'analyticsDisplay',
        form: {
          title: 'Scary Adventures Analytics Dashboard',
          description: 'Community and Global game performance',
          fields: [
            {
              type: 'paragraph',
              name: 'analytics',
              label: 'Analytics Data',
              disabled: true,
              lineHeight: 20,
              defaultValue: analyticsText
            }
          ],
          acceptLabel: 'Close'
        }
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
};