import React, { useState, useEffect } from 'react';
import { Trophy, ThumbsUp, ThumbsDown, Play, Filter, Crown, Medal, Award } from 'lucide-react';
import { Story, Tone } from '../../shared/types/game';

type LeaderboardEntry = {
  story: Story;
  likes: number;
  dislikes: number;
  totalVotes: number;
  likeRatio: number;
  score: number;
};

type LeaderboardProps = {
  onPlayStory: (story: Story) => void;
  onClose: () => void;
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ onPlayStory, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState<Tone | 'all'>('all');

  const tones: (Tone | 'all')[] = ['all', 'Gothic', 'Slasher', 'Psychological', 'Cosmic'];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTone]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const endpoint = selectedTone === 'all' 
        ? '/api/leaderboard?limit=10'
        : `/api/leaderboard/${selectedTone}?limit=10`;
        
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="rank-icon gold" />;
      case 2: return <Medal className="rank-icon silver" />;
      case 3: return <Award className="rank-icon bronze" />;
      default: return <span className="rank-number">#{rank}</span>;
    }
  };

  const getToneColor = (tone: Tone) => {
    switch (tone) {
      case 'Gothic': return '#8B0000';
      case 'Slasher': return '#DC143C';
      case 'Psychological': return '#4B0082';
      case 'Cosmic': return '#191970';
      default: return '#666';
    }
  };

  const formatPercentage = (ratio: number) => {
    return `${Math.round(ratio * 100)}%`;
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <div className="leaderboard-header">
          <div className="header-content">
            <Trophy className="leaderboard-trophy" />
            <h2>Top Rated Adventures</h2>
            <p>Discover the most beloved adventures</p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="leaderboard-filters">
          <Filter className="filter-icon" />
          <div className="tone-filters">
            {tones.map((tone) => (
              <button
                key={tone}
                className={`tone-filter ${selectedTone === tone ? 'active' : ''}`}
                onClick={() => setSelectedTone(tone)}
              >
                {tone === 'all' ? 'All' : tone}
              </button>
            ))}
          </div>
        </div>

        <div className="leaderboard-content">
          {isLoading ? (
            <div className="leaderboard-loading">
              <div className="loading-spinner">Loading leaderboard...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="leaderboard-empty">
              <Trophy className="empty-trophy" />
              <h3>No stories found</h3>
              <p>Be the first to rate some stories!</p>
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div key={entry.story.story_id} className="leaderboard-item">
                  <div className="rank-section">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="story-info">
                    <h3 className="story-title">{entry.story.story_title}</h3>
                    <div className="story-meta">
                      <span 
                        className="story-tone"
                        style={{ color: getToneColor(entry.story.tone) }}
                      >
                        {entry.story.tone}
                      </span>
                      <span className="story-duration">{entry.story.duration}</span>
                    </div>
                    <p className="story-description">{entry.story.art_direction}</p>
                  </div>
                  
                  <div className="rating-stats">
                    <div className="vote-counts">
                      <div className="vote-stat likes">
                        <ThumbsUp className="vote-icon" />
                        <span>{entry.likes}</span>
                      </div>
                      <div className="vote-stat dislikes">
                        <ThumbsDown className="vote-icon" />
                        <span>{entry.dislikes}</span>
                      </div>
                    </div>
                    <div className="rating-summary">
                      <div className="like-ratio">{formatPercentage(entry.likeRatio)} liked</div>
                      <div className="total-votes">{entry.totalVotes} votes</div>
                    </div>
                  </div>
                  
                  <div className="play-section">
                    <button 
                      className="play-story-button"
                      onClick={() => onPlayStory(entry.story)}
                    >
                      <Play className="play-icon" />
                      Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};