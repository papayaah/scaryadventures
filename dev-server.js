import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load actual story files
const loadStoryFiles = () => {
  const storiesDir = path.join(__dirname, 'src', 'client', 'public', 'assets', 'stories');
  const storyFiles = fs.readdirSync(storiesDir).filter(file => file.endsWith('.json'));
  
  return storyFiles.map(file => {
    const filePath = path.join(storiesDir, file);
    const storyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return storyData;
  });
};

const app = express();
const PORT = 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log requests
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Note: Static assets are now served by Vite from src/client/public/

// Load actual stories from JSON files
let sampleStories = [];

try {
  sampleStories = loadStoryFiles();
  console.log(`📚 Loaded ${sampleStories.length} stories from JSON files`);
} catch (error) {
  console.error('Failed to load story files, using fallback data:', error);
  // Fallback stories data
  sampleStories = [
  {
    story_id: "story_1761046996003_9npmboyc5",
    story_title: "Gears of the Great Unwinding",
    tone: "Cosmic",
    duration: "medium",
    art_direction: "A visual narrative exploring the liminal space between an abandoned amusement park and a cosmic horror dimension.",
    settings: {
      tone: "Cosmic",
      language: "simple",
      narrative: "second_person",
      pacing: "moderate",
      violence: "moderate",
      imagery: "rich",
      dialogue: "whispers",
      duration: "medium"
    },
    image_settings: {
      image_style: "pixel_horror",
      lighting_mood: "undefined",
      color_palette: "undefined",
      camera_perspective: "first_person"
    },
    scenes: [
      {
        id: "scene1",
        title: "The Veiled Entry",
        text: "You stand before the park's rusted entrance. Ancient gates sag inward. An unnatural darkness presses close, thicker than any night. It swirls, almost breathing. A faint, metallic groan echoes from deep within the forgotten grounds. This place is not merely abandoned; it is watched. You feel an unseen presence, vast and cold.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. Rusted, ornate iron gates slightly ajar at the center foreground, leading into an oppressive, swirling supernatural darkness that swallows the background. Broken sign for 'Aetherium Park' hangs above the gates. Twisted, skeletal trees are barely visible on the left and right.",
        choices: [
          {
            id: "1",
            text: "Head straight towards the perceived center of the park.",
            next: "scene2"
          },
          {
            id: "2",
            text: "Investigate a broken ticket booth to your right.",
            next: "scene2a"
          }
        ],
        ending: false
      },
      {
        id: "scene2",
        title: "The Cosmic Spire",
        text: "You emerge into a vast, central plaza. A colossal carousel dominates the space, its fractured structure slowly rotating. It is not for rides. Strange, glowing artifacts are affixed to its platforms, pulsing with alien light. The supernatural darkness here is a living thing, flowing like oil. A low, non-human hum vibrates through your bones. It speaks of things beyond stars.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. A massive, broken carousel structure at the center, slowly rotating. Several glowing, alien artifacts are visible on its platforms. The ground is cracked concrete. Deep, swirling supernatural darkness engulfs the background and edges, moving like a living liquid. The air shimmers slightly from an incomprehensible hum.",
        choices: [
          {
            id: "1",
            text: "Approach the rotating carousel.",
            next: "ending1"
          },
          {
            id: "2",
            text: "Turn back and flee this cursed place.",
            next: "ending2"
          }
        ],
        ending: false
      },
      {
        id: "scene2a",
        title: "The Whispering Booth",
        text: "You cautiously approach the dilapidated ticket booth. Its glass is shattered. Inside, the air is still and cold. A faint, almost imperceptible whisper drifts from the shadows. It sounds like many voices speaking one word: 'Claim...' On the counter, a single, tarnished brass key rests. It seems to vibrate with an inner chill. The darkness here feels dense.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. A broken ticket booth on the right foreground, its glass shattered. A tarnished brass key rests on the counter at eye level. Shadows fill the booth's interior. The background is oppressive, swirling supernatural darkness. Faint, ethereal green mist around the key.",
        choices: [
          {
            id: "1",
            text: "Take the brass key.",
            next: "ending3"
          },
          {
            id: "2",
            text: "Turn back and head for the central plaza.",
            next: "scene2"
          }
        ],
        ending: false
      },
      {
        id: "ending1",
        title: "Absorption into the Void",
        text: "As you approach the carousel, the cosmic artifacts pulse brighter. The darkness rushes towards you, pulled by an irresistible force. You feel your own essence unravelling, your memories dissolving into raw energy. The carousel grows slightly, an infinitesimal part of a cosmic maw. You are absorbed, becoming nothing more than a whisper in an incomprehensible void. You cease to exist.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. Your hand, partially transparent and dissolving into swirling motes of light, reaches toward a pulsating cosmic artifact. The carousel is drawing in strands of light and essence from your dissolving form. The background is a maelstrom of supernatural darkness, consuming all.",
        choices: [],
        ending: true,
        ending_type: "Absorption"
      },
      {
        id: "ending2",
        title: "Escape into Madness",
        text: "You turn and run, but the park's influence follows. The cosmic knowledge you've glimpsed burns in your mind. You escape the physical place, but the mental scars remain. In quiet moments, you hear the carousel's hum, see the swirling darkness at the edge of your vision. You are free, but forever changed by what lies beyond the veil.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. Running through the rusted gates, looking back at the swirling darkness. The park fades behind you, but cosmic symbols and alien geometries flicker at the edges of your vision, suggesting the horror follows you.",
        choices: [],
        ending: true,
        ending_type: "Escape"
      },
      {
        id: "ending3",
        title: "The Keeper's Burden",
        text: "The brass key is cold in your hand. As you hold it, whispers fill your mind with cosmic truths. You understand now - you are the new keeper of this place, bound to maintain the barrier between worlds. The darkness recedes, acknowledging your role. You will guard this threshold for eternity, protecting reality from what lies beyond.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, undefined, undefined, subtle film grain. Your hand holds the glowing brass key, now pulsing with cosmic energy. The park transforms around you, becoming a cosmic observatory. You stand as a sentinel between worlds, the darkness now your ally rather than enemy.",
        choices: [],
        ending: true,
        ending_type: "Transformation"
      }
    ],
    _metadata: {
      provider: "Gemini",
      model: "gemini-2.5-flash",
      generated_at: "2025-10-21T11:44:32.500Z"
    }
  },
  {
    story_id: "story_gothic_manor",
    story_title: "The Crimson Manor",
    tone: "Gothic",
    duration: "short",
    art_direction: "A decaying Victorian manor shrouded in perpetual mist, where family secrets and ancient curses intertwine.",
    settings: {
      tone: "Gothic",
      language: "elevated",
      narrative: "second_person",
      pacing: "slow",
      violence: "mild",
      imagery: "rich",
      dialogue: "whispers",
      duration: "short"
    },
    image_settings: {
      image_style: "pixel_horror",
      lighting_mood: "candlelight",
      color_palette: "muted_reds",
      camera_perspective: "first_person"
    },
    scenes: [
      {
        id: "scene1",
        title: "The Inheritance",
        text: "You stand before the wrought iron gates of Ravenshollow Manor. The letter from the solicitor crinkles in your trembling hand - you are the sole heir to this crumbling estate. Gargoyles perch atop the gate posts, their stone eyes seeming to track your movement. A path winds through overgrown gardens toward the manor's imposing facade. Thunder rumbles overhead.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, flickering candlelight, warm amber glow, muted red color palette, burgundy and crimson tones, subtle film grain. Ornate wrought iron gates with gargoyle statues. A crumbling Victorian manor looms in the background through overgrown gardens. Storm clouds gather overhead.",
        choices: [
          {
            id: "1",
            text: "Enter through the main gates.",
            next: "ending1"
          },
          {
            id: "2",
            text: "Look for a servant's entrance around back.",
            next: "ending2"
          }
        ],
        ending: false
      },
      {
        id: "ending1",
        title: "Blood Remembers",
        text: "As you enter the manor, you realize with growing horror that the portraits on the walls all bear your features. The final portrait shows you as you are now, but with eyes that hold centuries of sorrow. You understand now - you have always been here, trapped in an endless cycle of inheritance and loss.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, flickering candlelight, warm amber glow, muted red color palette, burgundy and crimson tones, subtle film grain. Close-up of a portrait that looks exactly like you, but with ancient, sorrowful eyes. Your reflection appears in the glass, overlapping with the painted face.",
        choices: [],
        ending: true,
        ending_type: "Revelation"
      },
      {
        id: "ending2",
        title: "The Foundation's Secret",
        text: "Around the back of the manor, you discover a hidden chamber beneath the foundation. Here you learn the truth - the manor is built upon a mass grave, and your family has served as its guardians for generations. The whispers welcome you home, and you take your place among the guardians of the family's dark legacy.",
        image_prompt: "32-bit painterly pixel horror, retro game aesthetic, cinematic first-person perspective, through your eyes, flickering candlelight, warm amber glow, muted red color palette, burgundy and crimson tones, subtle film grain. Underground chamber with stone walls. Ghostly figures emerge from the shadows, reaching out in welcome. Ancient bones are visible in the foundation stones.",
        choices: [],
        ending: true,
        ending_type: "Acceptance"
      }
    ],
    _metadata: {
      provider: "Custom",
      model: "handcrafted",
      generated_at: "2025-10-21T15:00:00.000Z"
    }
  }
  ];
}

// Game API endpoints
app.get('/api/test', (_req, res) => {
  res.json({ message: 'Local dev API is working!', timestamp: new Date().toISOString() });
});

app.get('/api/stories', (req, res) => {
  try {
    const { tone, duration } = req.query;
    
    let filteredStories = sampleStories;
    
    if (tone) {
      filteredStories = filteredStories.filter(story => story.tone === tone);
    }
    
    if (duration) {
      filteredStories = filteredStories.filter(story => story.duration === duration);
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json({
      stories: filteredStories,
      total: filteredStories.length
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

app.get('/api/stories/random', (req, res) => {
  try {
    console.log('getRandomStory called with query:', req.query);
    const { tone, duration } = req.query;
    
    let availableStories = sampleStories;
    console.log('Total stories available:', availableStories.length);
    
    if (tone) {
      availableStories = availableStories.filter(story => story.tone === tone);
      console.log(`Filtered by tone "${tone}":`, availableStories.length);
    }
    
    if (duration) {
      availableStories = availableStories.filter(story => story.duration === duration);
      console.log(`Filtered by duration "${duration}":`, availableStories.length);
    }
    
    if (availableStories.length === 0) {
      console.log('No stories found matching criteria');
      return res.status(404).json({ error: 'No stories found matching criteria' });
    }
    
    const randomIndex = Math.floor(Math.random() * availableStories.length);
    const selectedStory = availableStories[randomIndex];
    
    console.log('Selected story:', selectedStory.story_title);
    
    // Ensure we're sending JSON with proper headers
    res.setHeader('Content-Type', 'application/json');
    res.json({ story: selectedStory });
  } catch (error) {
    console.error('Error fetching random story:', error);
    res.status(500).json({ error: 'Failed to fetch random story', details: error.message });
  }
});

app.get('/api/stories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const story = sampleStories.find(s => s.story_id === id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Rating endpoints (local mock)
app.get('/api/stories/:storyId/ratings', (req, res) => {
  const { storyId } = req.params;
  console.log(`Getting ratings for story: ${storyId}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    likes: Math.floor(Math.random() * 50) + 10,
    dislikes: Math.floor(Math.random() * 10) + 2,
    userRating: undefined
  });
});

app.post('/api/stories/:storyId/rate', (req, res) => {
  const { storyId } = req.params;
  const { rating } = req.body;
  
  console.log(`Rating story ${storyId} as: ${rating}`);
  
  if (!rating || !['like', 'dislike'].includes(rating)) {
    return res.status(400).json({ error: 'Invalid rating. Must be "like" or "dislike"' });
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'Rating saved (local mock)',
    likes: Math.floor(Math.random() * 50) + 10,
    dislikes: Math.floor(Math.random() * 10) + 2,
    userRating: rating
  });
});

app.delete('/api/stories/:storyId/rating', (req, res) => {
  const { storyId } = req.params;
  console.log(`Removing rating for story: ${storyId}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'Rating removed (local mock)',
    likes: Math.floor(Math.random() * 50) + 10,
    dislikes: Math.floor(Math.random() * 10) + 2,
    userRating: undefined
  });
});

// User endpoints (local mock)
app.get('/api/user', (req, res) => {
  console.log('Getting current user info');
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    userId: 'local_user_123',
    username: 'LocalPlayer',
    isAuthenticated: false
  });
});

app.get('/api/user/history', (req, res) => {
  console.log('Getting user history');
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    playedStories: [],
    totalPlayed: 0
  });
});

app.post('/api/user/history', (req, res) => {
  const { storyId } = req.body;
  console.log(`Adding story to history: ${storyId}`);
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'Story added to history (local mock)',
    playedStories: [storyId],
    totalPlayed: 1
  });
});

app.delete('/api/user/history', (req, res) => {
  console.log('Clearing user history');
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true,
    message: 'History cleared (local mock)',
    playedStories: [],
    totalPlayed: 0
  });
});

// Leaderboard endpoints (local mock)
app.get('/api/leaderboard', (req, res) => {
  const { limit = '10' } = req.query;
  const maxResults = Math.min(parseInt(limit) || 10, 50);
  
  console.log(`Getting mock leaderboard with limit: ${maxResults}`);
  
  const mockLeaderboard = [
    {
      story: {
        story_id: 'story_1761046996003_9npmboyc5',
        story_title: 'Gears of the Great Unwinding',
        tone: 'Cosmic',
        duration: 'medium',
        art_direction: 'A visual narrative exploring the liminal space between an abandoned amusement park and a cosmic horror dimension.',
        settings: { tone: 'Cosmic', language: 'simple', narrative: 'second_person', pacing: 'moderate', violence: 'moderate', imagery: 'rich', dialogue: 'whispers', duration: 'medium' },
        image_settings: { image_style: 'pixel_horror', lighting_mood: 'undefined', color_palette: 'undefined', camera_perspective: 'first_person' },
        scenes: [],
        _metadata: { provider: 'Gemini', model: 'gemini-2.5-flash', generated_at: '2025-10-21T11:44:32.500Z' }
      },
      likes: 45,
      dislikes: 5,
      totalVotes: 50,
      likeRatio: 0.9,
      score: 0.85
    },
    {
      story: {
        story_id: 'story_1761049401396_ggrqycx9t',
        story_title: 'The Gilded Maw',
        tone: 'Slasher',
        duration: 'medium',
        art_direction: 'A haunting antique shop filled with cursed objects.',
        settings: { tone: 'Slasher', language: 'elevated', narrative: 'second_person', pacing: 'moderate', violence: 'moderate', imagery: 'rich', dialogue: 'whispers', duration: 'medium' },
        image_settings: { image_style: 'pixel_horror', lighting_mood: 'storm_lightning', color_palette: 'desaturated_pastels', camera_perspective: 'first_person' },
        scenes: [],
        _metadata: { provider: 'Gemini', model: 'gemini-2.0-flash', generated_at: '2025-10-21T12:23:35.456Z' }
      },
      likes: 32,
      dislikes: 8,
      totalVotes: 40,
      likeRatio: 0.8,
      score: 0.72
    },
    {
      story: {
        story_id: 'story_gothic_manor',
        story_title: 'The Crimson Manor',
        tone: 'Gothic',
        duration: 'short',
        art_direction: 'A decaying Victorian manor shrouded in perpetual mist.',
        settings: { tone: 'Gothic', language: 'elevated', narrative: 'second_person', pacing: 'slow', violence: 'mild', imagery: 'rich', dialogue: 'whispers', duration: 'short' },
        image_settings: { image_style: 'pixel_horror', lighting_mood: 'candlelight', color_palette: 'muted_reds', camera_perspective: 'first_person' },
        scenes: [],
        _metadata: { provider: 'Custom', model: 'handcrafted', generated_at: '2025-10-21T15:00:00.000Z' }
      },
      likes: 28,
      dislikes: 12,
      totalVotes: 40,
      likeRatio: 0.7,
      score: 0.65
    }
  ];
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    leaderboard: mockLeaderboard.slice(0, maxResults),
    total: mockLeaderboard.length
  });
});

app.get('/api/leaderboard/:tone', (req, res) => {
  const { tone } = req.params;
  const { limit = '10' } = req.query;
  
  console.log(`Getting mock leaderboard for tone: ${tone}`);
  
  // Filter mock data by tone
  const mockLeaderboard = [
    // ... same mock data as above
  ].filter(entry => entry.story.tone.toLowerCase() === tone.toLowerCase());
  
  res.setHeader('Content-Type', 'application/json');
  res.json({
    leaderboard: mockLeaderboard.slice(0, parseInt(limit) || 10),
    total: mockLeaderboard.length
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', server: 'local-dev' });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📚 Stories API available at http://localhost:${PORT}/api/stories`);
  console.log(`🎲 Random story API available at http://localhost:${PORT}/api/stories/random`);
  console.log(`📁 Static assets served by Vite from /public/assets/`);
});