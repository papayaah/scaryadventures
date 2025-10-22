import React, { useState, useRef, useEffect } from 'react';
import { Settings, DoorOpen, User, RotateCcw, Trophy, RefreshCw } from 'lucide-react';
import { Tone, Duration, Story } from '../../shared/types/game';
import { Leaderboard } from './Leaderboard';

type UserInfo = {
  userId: string;
  username: string;
  isAuthenticated: boolean;
};

type UserHistory = {
  playedStories: string[];
  totalPlayed: number;
};

type MainMenuProps = {
  onStartGame: (tone?: Tone, duration?: Duration) => void;
  onPlayStory?: (story: Story) => void;
  userInfo?: UserInfo | null;
  userHistory?: UserHistory;
  onClearHistory?: () => void;
};

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onPlayStory,
  userInfo,
  userHistory,
  onClearHistory
}) => {
  // Load settings from localStorage or default to 'Random'
  const [selectedTone, setSelectedTone] = useState<Tone | 'Random'>(() => {
    try {
      const saved = localStorage.getItem('scary-adventures-tone');
      return (saved as Tone | 'Random') || 'Random';
    } catch {
      return 'Random';
    }
  });

  const [selectedDuration, setSelectedDuration] = useState<Duration | 'Random'>(() => {
    try {
      const saved = localStorage.getItem('scary-adventures-duration');
      return (saved as Duration | 'Random') || 'Random';
    } catch {
      return 'Random';
    }
  });

  const [showSelections, setShowSelections] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const tones: (Tone | 'Random')[] = [
    'Random',
    'Gothic',
    'Slasher',
    'Psychological',
    'Cosmic',
    'Folk',
    'Supernatural',
    'Occult',
    'Body Horror',
    'Surreal',
    'Noir Horror'
  ];
  const durations: (Duration | 'Random')[] = ['Random', 'short', 'medium', 'long'];

  useEffect(() => {
    // Auto-play the hero video
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('scary-adventures-tone', selectedTone);
    } catch (error) {
      console.warn('Failed to save tone setting:', error);
    }
  }, [selectedTone]);

  useEffect(() => {
    try {
      localStorage.setItem('scary-adventures-duration', selectedDuration);
    } catch (error) {
      console.warn('Failed to save duration setting:', error);
    }
  }, [selectedDuration]);

  const handleBeginAdventure = () => {
    // Convert 'Random' selections to undefined for the API
    const toneParam = selectedTone === 'Random' ? undefined : selectedTone;
    const durationParam = selectedDuration === 'Random' ? undefined : selectedDuration;

    onStartGame(toneParam, durationParam);
  };

  const handlePlayStory = (story: Story) => {
    setShowLeaderboard(false);
    if (onPlayStory) {
      onPlayStory(story);
    }
  };

  const handleRefreshStories = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/stories/refresh', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        alert(`✅ Stories refreshed! ${result.stories.length} stories loaded.`);
      } else {
        alert('❌ Failed to refresh stories. Check console for details.');
      }
    } catch (error) {
      console.error('Error refreshing stories:', error);
      alert('❌ Error refreshing stories. Check console for details.');
    } finally {
      setIsRefreshing(false);
    }
  };



  const getToneDescription = (tone: Tone | 'Random'): string => {
    switch (tone) {
      case 'Random': return 'Let fate choose your terror';
      case 'Gothic': return 'Dark castles, ancient curses, and supernatural dread';
      case 'Slasher': return 'Relentless pursuit, sharp edges, and mortal terror';
      case 'Psychological': return 'Mind games, reality bends, and inner demons';
      case 'Cosmic': return 'Vast unknowns, eldritch horrors, and cosmic insignificance';
      case 'Folk': return 'Pastoral tales that twist into unease and wrongness';
      case 'Supernatural': return 'Classic ghost stories balancing sorrow and menace';
      case 'Occult': return 'Ritualistic mysteries with symbols and ancient knowledge';
      case 'Body Horror': return 'Grotesque transformations between human and inhuman';
      case 'Surreal': return 'Fragmented reality where walls breathe and logic fails';
      case 'Noir Horror': return 'Gritty urban decay with cynical inner monologue';
    }
  };

  const getDurationDescription = (duration: Duration | 'Random'): string => {
    switch (duration) {
      case 'Random': return 'Surprise me with the length';
      case 'short': return '5-10 minutes of terror';
      case 'medium': return '15-20 minutes of suspense';
      case 'long': return '25-30 minutes of horror';
    }
  };

  return (
    <div className="main-menu">
      {/* Hero Video */}
      <div className="hero-section">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />
      </div>

      {/* Title */}
      <div className="title-section">
        <img
          src="/assets/title.png"
          alt="Scary Adventures"
          className="title-image"
          onError={(e) => {
            console.error('Failed to load title image');
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1 className="fallback-title">Scary Adventures</h1>
        <p className="subtitle">Pick a path. Face the unknown.</p>
      </div>

      {/* Main Actions */}
      <div className="action-section">
        <button
          className="primary-button begin-adventure-button"
          onClick={handleBeginAdventure}
        >
          <DoorOpen className="button-icon" />
          Begin Adventure
        </button>

        <button
          className="secondary-button customize-button"
          onClick={() => setShowSelections(!showSelections)}
        >
          <Settings className="button-icon" />
          Customize
        </button>

        <button
          className="secondary-button leaderboard-button"
          onClick={() => setShowLeaderboard(true)}
        >
          <Trophy className="button-icon" />
          Top Rated Adventures
        </button>

        <button
          className="secondary-button refresh-button"
          onClick={handleRefreshStories}
          disabled={isRefreshing}
          title="Refresh story cache (loads new stories you've added)"
        >
          <RefreshCw className={`button-icon ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Stories'}
        </button>

      </div>

      {/* Selection Panel */}
      {showSelections && (
        <div className="selection-panel">
          <div className="selection-group">
            <h3>Choose Your Adventure</h3>
            <p className="selection-hint">
              Selected: {selectedTone} tone, {selectedDuration} duration
            </p>
            <div className="tone-grid">
              {tones.map((tone) => (
                <button
                  key={tone}
                  className={`tone-button ${selectedTone === tone ? 'selected' : ''}`}
                  onClick={() => setSelectedTone(tone)}
                >
                  <span className="tone-name">{tone}</span>
                  <span className="tone-description">{getToneDescription(tone)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="selection-group">
            <h3>Choose Your Duration</h3>
            <div className="duration-grid">
              {durations.map((duration) => (
                <button
                  key={duration}
                  className={`duration-button ${selectedDuration === duration ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(duration)}
                >
                  <span className="duration-name">{duration.charAt(0).toUpperCase() + duration.slice(1)}</span>
                  <span className="duration-description">{getDurationDescription(duration)}</span>
                </button>
              ))}
            </div>
          </div>


        </div>
      )}

      {/* User Info Panel */}
      {userInfo && (
        <div className="user-info-panel">
          <div className="user-info">
            <User className="user-icon" />
            <div className="user-details">
              <span className="username">{userInfo.username}</span>
              {userHistory && userHistory.totalPlayed > 0 && (
                <span className="story-count">
                  {userHistory.totalPlayed} adventure{userHistory.totalPlayed !== 1 ? 's' : ''} experienced
                </span>
              )}
            </div>
          </div>

          {userHistory && userHistory.totalPlayed > 0 && onClearHistory && (
            <button
              className="clear-history-button"
              onClick={onClearHistory}
              title="Clear your story history to see all adventures again"
            >
              <RotateCcw className="clear-icon" />
              Reset History
            </button>
          )}
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          onPlayStory={handlePlayStory}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Atmospheric Elements */}
      <div className="atmosphere">
        <div className="fog-layer fog-1" />
        <div className="fog-layer fog-2" />
        <div className="fog-layer fog-3" />
      </div>
    </div>
  );
};