import React, { useState, useEffect } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { Story, Scene, Choice, Tone, Duration } from '../../shared/types/game';
import { StoryRating } from './StoryRating';

// Helper function to get the story folder name from story title
const getStoryFolderName = (storyTitle: string): string => {
  return storyTitle.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Helper function to construct image path
const getSceneImagePath = (story: Story, scene: Scene): string => {
  const storyFolder = getStoryFolderName(story.story_title);
  
  // Check if scene has a custom image filename
  if (scene.image_filename) {
    return `/assets/scenes/${storyFolder}_2025-10-21/${scene.image_filename}`;
  }
  
  // Default to .jpg extension
  return `/assets/scenes/${storyFolder}_2025-10-21/${scene.id}.jpg`;
};

type GameViewProps = {
  story: Story;
  onGameEnd: () => void;
  onRestartWithSettings?: (tone?: Tone, duration?: Duration) => void;
  currentTone?: Tone | undefined;
  currentDuration?: Duration | undefined;
};

export const GameView: React.FC<GameViewProps> = ({ 
  story, 
  onGameEnd, 
  onRestartWithSettings,
  currentTone,
  currentDuration 
}) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    // Start with the first scene
    if (story.scenes && story.scenes.length > 0) {
      setCurrentScene(story.scenes[0] || null);
      setImageLoading(true); // Reset image loading for new scene
    }
  }, [story]);

  useEffect(() => {
    // Reset image loading when scene changes
    setImageLoading(true);
  }, [currentScene]);

  const handleChoice = async (choice: Choice) => {
    setIsLoading(true);
    
    // Find the next scene
    const nextScene = story.scenes?.find(scene => scene.id === choice.next);
    
    if (nextScene) {
      // Simulate loading time for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentScene(nextScene);
    }
    
    setIsLoading(false);
  };

  const handleRestart = () => {
    // Use the restart function with current settings if available
    if (onRestartWithSettings) {
      onRestartWithSettings(currentTone, currentDuration);
    } else {
      // Fallback to ending the game
      onGameEnd();
    }
  };



  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imagePath = currentScene ? getSceneImagePath(story, currentScene) : '';
    console.warn(`Failed to load scene image: ${imagePath}`);
    setImageLoading(false);
    // Use missing.jpeg as fallback
    e.currentTarget.src = '/assets/missing.jpeg';
    e.currentTarget.alt = 'Scene image not available';
  };

  if (!currentScene) {
    return (
      <div className="game-view loading">
        <div className="loading-spinner">
          <img src="/assets/loading.gif" alt="Loading..." />
          <p>Preparing your nightmare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-view">
      {/* Scene Image */}
      <div className="scene-image">
        {imageLoading && (
          <div className="image-loading">
            <img src="/assets/loading.gif" alt="Loading..." className="loading-gif" />
            <p>Loading scene...</p>
          </div>
        )}
        <img 
          src={currentScene ? getSceneImagePath(story, currentScene) : ''}
          alt="Scene Image"
          className="scene-image-img"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        <div className="image-placeholder" style={{ display: 'none' }}>
          <span className="image-text">Scene Image</span>
        </div>
      </div>

      {/* Story Content */}
      <div className="story-content">
        <div className="scene-text">
          <p>{currentScene.text}</p>
        </div>

        {/* Choices or Ending */}
        {currentScene.ending ? (
          <div className="ending-section">
            <div className="ending-actions">
              <button className="primary-button" onClick={onGameEnd}>
                <Home className="button-icon" />
                Return to Menu
              </button>
              
              <button className="primary-button" onClick={handleRestart}>
                <RotateCcw className="button-icon" />
                Begin Another Adventure
              </button>
            </div>
            
            {/* Story Rating */}
            <StoryRating 
              storyId={story.story_id} 
              storyTitle={story.story_title}
            />
          </div>
        ) : (
          <div className="choices-section">
            {isLoading ? (
              <div className="choice-loading">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Your fate unfolds...</p>
              </div>
            ) : (
              <div className="choices-grid">
                {currentScene.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    className={`choice-button choice-${index + 1}`}
                    onClick={() => handleChoice(choice)}
                  >
                    <span className="choice-number">{index + 1}</span>
                    <span className="choice-text">{choice.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


      </div>

      {/* Atmospheric overlay */}
      <div className="game-atmosphere">
        <div className="vignette" />
      </div>
    </div>
  );
};