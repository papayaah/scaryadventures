import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'scary-adventures',
      backgroundUri: 'default-splash.jpeg',
      buttonLabel: 'Adventure on your own peril',
      description: 'Sinister, macabre, gothic stories awaits.',
      heading: 'The Curtain Rises',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: 'Scary Adventures',
  });
};
