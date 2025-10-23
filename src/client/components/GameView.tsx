import React, { useState, useEffect } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import { Story, Scene, Choice, Tone, Duration } from '../../shared/types/game';
import { StoryRating } from './StoryRating';
import { StoryStatistics } from './StoryStatistics';



// Helper function to construct image path
const getSceneImagePath = (story: Story, scene: Scene): string => {
  // Use the story's filename (without .json extension) as the folder name
  const folderName = story.filename ? story.filename.replace('.json', '') : 'default';

  // Check if scene has a custom image filename
  if (scene.image_filename) {
    return `/assets/scenes/${folderName}/${scene.image_filename}`;
  }

  // Default to .jpg extension
  return `/assets/scenes/${folderName}/${scene.id}.jpg`;
};

type GameViewProps = {
  story: Story;
  onGameEnd: () => void;
  onRestartWithSettings?: (tone?: Tone, duration?: Duration) => void;
  currentTone?: Tone | undefined;
  currentDuration?: Duration | undefined;
  trackStoryCompletion?: (storyId: string) => Promise<void>;
  trackStoryAbandonment?: (storyId: string) => Promise<void>;
};

export const GameView: React.FC<GameViewProps> = ({
  story,
  onGameEnd,
  onRestartWithSettings,
  currentTone,
  currentDuration,
  trackStoryCompletion,
  trackStoryAbandonment
}) => {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageTransitioning, setImageTransitioning] = useState(false);

  const handleAbandonStory = () => {
    // Track story abandonment with time
    if (trackStoryAbandonment) {
      trackStoryAbandonment(story.story_id).catch(error => {
        console.error('Failed to track story abandonment:', error);
      });
    }
    
    onGameEnd();
  };

  useEffect(() => {
    // Start with the first scene
    if (story.scenes && story.scenes.length > 0) {
      const firstScene = story.scenes[0];
      setCurrentScene(firstScene || null);

      // Check if the first scene image is already cached (preloaded)
      if (firstScene) {
        const imagePath = getSceneImagePath(story, firstScene);
        const testImage = new Image();
        testImage.onload = () => {
          // Image is cached, no need to show loading
          setImageLoading(false);
        };
        testImage.onerror = () => {
          // Image failed to load, show loading state
          setImageLoading(true);
        };
        testImage.src = imagePath;

        // If image loads synchronously (cached), onload fires immediately
        if (testImage.complete) {
          setImageLoading(false);
        } else {
          setImageLoading(true);
        }
      }

      // Preload the second scene image if it exists
      if (story.scenes.length > 1) {
        const secondScene = story.scenes[1];
        if (secondScene) {
          const secondSceneImagePath = getSceneImagePath(story, secondScene);
          const preloadImage = new Image();
          preloadImage.src = secondSceneImagePath;
          // No need to handle load/error events for preloading
        }
      }
    }
  }, [story]);

  useEffect(() => {
    // Reset image loading when scene changes, but check if image is cached first
    if (currentScene) {
      const imagePath = getSceneImagePath(story, currentScene);
      const testImage = new Image();
      testImage.onload = () => {
        // Image is cached, no need to show loading
        setImageLoading(false);
      };
      testImage.onerror = () => {
        // Image failed to load, show loading state
        setImageLoading(true);
      };
      testImage.src = imagePath;

      // If image loads synchronously (cached), onload fires immediately
      if (testImage.complete) {
        setImageLoading(false);
      } else {
        setImageLoading(true);
      }

      // Track story completion if this is an ending scene
      if (currentScene.ending) {
        try {
          // Track for analytics
          fetch('/api/analytics/story-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storyId: story.story_id
            })
          }).catch(error => {
            console.error('Failed to track story completion:', error);
          });

          // Track for user stats with time
          if (trackStoryCompletion) {
            trackStoryCompletion(story.story_id).catch(error => {
              console.error('Failed to track user stats completion:', error);
            });
          }
        } catch (error) {
          console.error('Failed to track story completion:', error);
        }
      }

      // Preload next scene images if current scene is not an ending scene
      if (!currentScene.ending && currentScene.choices && currentScene.choices.length > 0) {
        currentScene.choices.forEach(choice => {
          const nextScene = story.scenes?.find(scene => scene.id === choice.next);
          if (nextScene) {
            const nextSceneImagePath = getSceneImagePath(story, nextScene);
            const preloadImage = new Image();
            preloadImage.src = nextSceneImagePath;
            // No need to handle load/error events for preloading
          }
        });
      }
    }
  }, [currentScene, story]);

  const handleChoice = async (choice: Choice) => {
    setIsLoading(true);

    // Find the next scene
    const nextScene = story.scenes?.find(scene => scene.id === choice.next);

    if (nextScene) {
      // Simulate loading time for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start fade out transition
      setImageTransitioning(true);

      // Wait for fade out to complete, then change scene
      setTimeout(() => {
        setCurrentScene(nextScene);
        
        // Smooth scroll to top during scene transition
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
        // Start fade in after scene change
        setTimeout(() => {
          setImageTransitioning(false);
        }, 50);
      }, 250); // Wait for fade out duration
    }

    setIsLoading(false);
  };

  const handleRestart = () => {
    // Use the restart function with user's current menu settings (not the last played story's settings)
    if (onRestartWithSettings) {
      // Don't pass any parameters so it uses the user's current menu preferences from localStorage
      onRestartWithSettings();
    } else {
      // Fallback to ending the game
      onGameEnd();
    }
  };



  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Double-check that this is the current scene's image
    const currentImagePath = currentScene ? getSceneImagePath(story, currentScene) : '';
    if (e.currentTarget.src.includes(currentImagePath) || e.currentTarget.complete) {
      setImageLoading(false);
    }
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
          key={currentScene?.id} // Force re-render when scene changes
          src={currentScene ? getSceneImagePath(story, currentScene) : ''}
          alt="Scene Image"
          className={`scene-image-img ${imageTransitioning ? 'transitioning' : ''}`}
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

            {/* Story Statistics */}
            <StoryStatistics
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
              <>
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
                
                {/* Abandon Story Button */}
                <div className="abandon-story-section">
                  <button className="abandon-button" onClick={handleAbandonStory}>
                    <Home className="abandon-icon" />
                    Abandon Adventure
                  </button>
                </div>
              </>
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