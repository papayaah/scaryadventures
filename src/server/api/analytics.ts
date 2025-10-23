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
    
    // Track story start
    await redis.incrBy(`analytics:story:${storyId}:started`, 1);
    
    // Track tone preference
    if (tone) {
      await redis.incrBy(`analytics:tone:${tone}`, 1);
    }
    
    // Track duration preference
    if (duration) {
      await redis.incrBy(`analytics:duration:${duration}`, 1);
    }
    
    // Track total games started
    await redis.incrBy('analytics:total:started', 1);
    
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
    
    // Track story completion
    await redis.incrBy(`analytics:story:${storyId}:completed`, 1);
    
    // Track total games completed
    await redis.incrBy('analytics:total:completed', 1);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking story completion:', error);
    res.status(500).json({ error: 'Failed to track story completion' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if Redis is available (only in Devvit environment)
    const isDevvitEnvironment = typeof redis !== 'undefined';
    
    if (!isDevvitEnvironment) {
      // Local development fallback - return mock analytics
      return res.json({
        analytics: {
          'analytics:total:started': '42',
          'analytics:total:completed': '38',
          'analytics:tone:Gothic': '15',
          'analytics:tone:Slasher': '12',
          'analytics:tone:Psychological': '8',
          'analytics:duration:short': '20',
          'analytics:duration:medium': '15',
          'analytics:duration:long': '7'
        },
        topRatedStories: [
          { storyId: 'story1', averageRating: 4.8, totalRatings: 25 },
          { storyId: 'story2', averageRating: 4.5, totalRatings: 18 }
        ]
      });
    }
    
    const stats: Record<string, string> = {};
    
    // Get analytics data by scanning for keys with analytics prefix
    const analyticsKeys = [
      'analytics:total:started',
      'analytics:total:completed'
    ];
    
    // Get tone analytics
    const tones = ['Gothic', 'Slasher', 'Psychological', 'Cosmic', 'Folk', 'Supernatural', 'Occult', 'Body Horror', 'Surreal', 'Noir Horror'];
    for (const tone of tones) {
      analyticsKeys.push(`analytics:tone:${tone}`);
    }
    
    // Get duration analytics
    const durations = ['short', 'medium', 'long'];
    for (const duration of durations) {
      analyticsKeys.push(`analytics:duration:${duration}`);
    }
    
    // Get all analytics data
    for (const key of analyticsKeys) {
      const value = await redis.get(key);
      stats[key] = value || "0";
    }
    
    // Note: Redis scan is not available in this environment
    // Story-specific analytics would need to be tracked differently
    
    // Log the analytics data to console for moderator to view
    const summary = {
      "Total Games Started": stats['analytics:total:started'] || '0',
      "Total Games Completed": stats['analytics:total:completed'] || '0',
      "Completion Rate": stats['analytics:total:started'] !== '0' 
        ? `${Math.round((parseInt(stats['analytics:total:completed'] || '0') / parseInt(stats['analytics:total:started'] || '1')) * 100)}%`
        : '0%',
      "Popular Categories": {
        "Gothic": stats['analytics:tone:Gothic'] || '0',
        "Slasher": stats['analytics:tone:Slasher'] || '0', 
        "Psychological": stats['analytics:tone:Psychological'] || '0',
        "Cosmic": stats['analytics:tone:Cosmic'] || '0',
        "Folk": stats['analytics:tone:Folk'] || '0',
        "Supernatural": stats['analytics:tone:Supernatural'] || '0',
        "Occult": stats['analytics:tone:Occult'] || '0',
        "Body Horror": stats['analytics:tone:Body Horror'] || '0',
        "Surreal": stats['analytics:tone:Surreal'] || '0',
        "Noir Horror": stats['analytics:tone:Noir Horror'] || '0'
      },
      "Duration Preferences": {
        "Short": stats['analytics:duration:short'] || '0',
        "Medium": stats['analytics:duration:medium'] || '0', 
        "Long": stats['analytics:duration:long'] || '0'
      }
    };
    
    console.log('=== SCARY ADVENTURES ANALYTICS ===');
    console.log(JSON.stringify(summary, null, 2));
    console.log('=== END ANALYTICS ===');
    
    // Format analytics data for display in a form
    const analyticsText = [
      `Total Games Started: ${summary["Total Games Started"]}`,
      `Total Games Completed: ${summary["Total Games Completed"]}`,
      `Completion Rate: ${summary["Completion Rate"]}`,
      '',
      'Popular Categories:',
      ...Object.entries(summary["Popular Categories"]).map(([category, count]) => `  ${category}: ${count}`),
      '',
      'Duration Preferences:',
      ...Object.entries(summary["Duration Preferences"]).map(([duration, count]) => `  ${duration}: ${count}`)
    ].join('\n');
    
    console.log('=== ANALYTICS TEXT FOR FORM ===');
    console.log(analyticsText);
    console.log('=== END ANALYTICS TEXT ===');

    // Return a form that displays the analytics data
    res.json({
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