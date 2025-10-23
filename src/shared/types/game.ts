export type Tone = 'Gothic' | 'Slasher' | 'Psychological' | 'Cosmic' | 'Folk' | 'Supernatural' | 'Occult' | 'Body Horror' | 'Surreal' | 'Noir Horror';
export type Duration = 'short' | 'medium' | 'long';

export type Choice = {
  id: string;
  text: string;
  next: string;
};

export type Scene = {
  id: string;
  title: string;
  text: string;
  image_prompt: string;
  choices: Choice[];
  ending: boolean;
  ending_type?: string;
  image_filename?: string; // Optional custom image filename (with extension)
};

export type Story = {
  story_id: string;
  story_title: string;
  tone: Tone;
  duration: Duration;
  art_direction: string;
  settings: {
    tone: Tone;
    language: string;
    narrative: string;
    pacing: string;
    violence: string;
    imagery: string;
    dialogue: string;
    duration: Duration;
  };
  image_settings: {
    image_style: string;
    lighting_mood: string;
    color_palette: string;
    camera_perspective: string;
  };
  scenes: Scene[];
  _metadata: {
    provider: string;
    model: string;
    generated_at: string;
  };
  filename?: string; // Added for asset path resolution
};

export type GameState = {
  currentStory: Story | null;
  currentScene: Scene | null;
  gameStarted: boolean;
  selectedTone?: Tone | undefined;
  selectedDuration?: Duration | undefined;
};