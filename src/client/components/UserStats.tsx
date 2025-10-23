import React, { useState, useEffect } from 'react';
import { X, Trophy, Target, Clock, Star, TrendingUp, Calendar, Award, BarChart3, Ghost, Heart, Flame, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserStats as UserStatsType, formatPlayTime } from '../../shared/types/api';

type UserInfo = {
  userId: string;
  username: string;
  isAuthenticated: boolean;
};

type UserStatsProps = {
  onClose: () => void;
  onClearHistory?: () => void;
  userInfo?: UserInfo | null;
};

export const UserStats: React.FC<UserStatsProps> = ({ onClose, onClearHistory, userInfo }) => {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/stats');
      
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAllStats = async () => {
    try {
      setIsResetting(true);
      
      // Call the complete reset API
      const response = await fetch('/api/user/reset-all-stats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Reload stats to show empty state
        await loadStats();
        setShowResetConfirm(false);
        setHoldProgress(0);
        
        // Also call the original onClearHistory to update main menu
        if (onClearHistory) {
          onClearHistory();
        }
      } else {
        throw new Error('Failed to reset statistics');
      }
    } catch (error) {
      console.error('Error resetting stats:', error);
      setError('Failed to reset statistics. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);
    
    const interval = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHolding(false);
          handleResetAllStats();
          return 100;
        }
        return prev + (100 / 30); // 30 steps over 3 seconds
      });
    }, 100);
    
    // Store interval ID to clear on mouse up
    (window as any).holdInterval = interval;
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if ((window as any).holdInterval) {
      clearInterval((window as any).holdInterval);
      (window as any).holdInterval = null;
    }
  };

  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'short': return 'Short (5-10 min)';
      case 'medium': return 'Medium (15-20 min)';
      case 'long': return 'Long (25-30 min)';
      default: return duration;
    }
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-300">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="stats-modal-overlay">
        <div className="stats-modal">
          <div className="stats-header">
            <h2>Loading Your Adventure Stats...</h2>
            <button className="close-button" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Analyzing your adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-modal-overlay">
        <div className="stats-modal">
          <div className="stats-header">
            <h2>Adventure Stats</h2>
            <button className="close-button" onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="error-content">
            <p>Unable to load your stats: {error || 'Unknown error'}</p>
            <button className="primary-button" onClick={loadStats}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-modal-overlay">
      <div className="stats-modal">
        <div className="stats-header">
          <div className="stats-header-content">
            <h2>Adventure Stats</h2>
            {userInfo && (
              <p className="stats-username">@{userInfo.username}</p>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="stats-content">


          {/* Overview Stats */}
          <div className="stats-section">
            <h3 className="stats-section-title">
              <BarChart3 className="w-5 h-5" />
              Adventure Overview
            </h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalCompleted}</div>
                  <div className="stat-label">Adventures Completed</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalStarted}</div>
                  <div className="stat-label">Adventures Started</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp className={`w-6 h-6 ${getCompletionColor(stats.completionRate)}`} />
                </div>
                <div className="stat-content">
                  <div className={`stat-number ${getCompletionColor(stats.completionRate)}`}>
                    {stats.completionRate}%
                  </div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.streakData.currentStreak}</div>
                  <div className="stat-label">Current Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements & Records */}
          <div className="stats-section">
            <h3 className="stats-section-title">
              <Trophy className="w-5 h-5" />
              Records & Achievements
            </h3>
            <div className="achievement-grid">
              {stats.longestStory && (
                <div className="achievement-card">
                  <div className="achievement-icon">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="achievement-content">
                    <div className="achievement-title">Longest Adventure</div>
                    <div className="achievement-subtitle">{stats.longestStory.title}</div>
                    <div className="achievement-detail">
                      {stats.longestStory.timeSpent 
                        ? formatPlayTime(stats.longestStory.timeSpent)
                        : formatDuration(stats.longestStory.duration)
                      }
                    </div>
                  </div>
                </div>
              )}

              {stats.shortestStory && (
                <div className="achievement-card">
                  <div className="achievement-icon">
                    <Clock className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="achievement-content">
                    <div className="achievement-title">Quickest Adventure</div>
                    <div className="achievement-subtitle">{stats.shortestStory.title}</div>
                    <div className="achievement-detail">
                      {stats.shortestStory.timeSpent 
                        ? formatPlayTime(stats.shortestStory.timeSpent)
                        : formatDuration(stats.shortestStory.duration)
                      }
                    </div>
                  </div>
                </div>
              )}

              <div className="achievement-card">
                <div className="achievement-icon">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div className="achievement-content">
                  <div className="achievement-title">Best Streak</div>
                  <div className="achievement-subtitle">{stats.streakData.longestStreak} adventures</div>
                  <div className="achievement-detail">Consecutive completions</div>
                </div>
              </div>

              {stats.averageRating > 0 && (
                <div className="achievement-card">
                  <div className="achievement-icon">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="achievement-content">
                    <div className="achievement-title">Average Rating</div>
                    <div className="achievement-subtitle">{renderStarRating(stats.averageRating)}</div>
                    <div className="achievement-detail">{stats.totalRatings} ratings given</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          {(Object.keys(stats.categoryBreakdown).length > 0 || Object.keys(stats.durationPreference).length > 0) && (
            <div className="stats-section">
              <h3 className="stats-section-title">
                <Target className="w-5 h-5" />
                Your Preferences
              </h3>
              <div className="preferences-grid">
                {Object.keys(stats.categoryBreakdown).length > 0 && (
                  <div className="preference-card">
                    <h4 className="preference-title">Favorite Categories</h4>
                    <div className="preference-list">
                      {Object.entries(stats.categoryBreakdown)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 3)
                        .map(([category, count]) => (
                          <div key={category} className="preference-item">
                            <span className="preference-name">{category}</span>
                            <span className="preference-count">{count} adventures</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {Object.keys(stats.durationPreference).length > 0 && (
                  <div className="preference-card">
                    <h4 className="preference-title">Duration Preferences</h4>
                    <div className="preference-list">
                      {Object.entries(stats.durationPreference)
                        .sort(([,a], [,b]) => b - a)
                        .map(([duration, count]) => (
                          <div key={duration} className="preference-item">
                            <span className="preference-name">{formatDuration(duration)}</span>
                            <span className="preference-count">{count} adventures</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {(stats.recentActivity && stats.recentActivity.length > 0) ? (
            <div className="stats-section">
              <h3 className="stats-section-title">
                <Calendar className="w-5 h-5" />
                Recent Adventures
              </h3>
              <div className="recent-activity">
                {stats.recentActivity.map((activity, index) => (
                  <div key={`${activity.storyId}-${index}`} className="activity-item">
                    <div className="activity-content">
                      <div className="activity-title">
                        {activity.title}
                        <span className={`activity-status ${activity.status === 'completed' ? 'completed' : 'abandoned'}`}>
                          {activity.status === 'completed' ? '✓ Completed' : '✗ Abandoned'}
                        </span>
                      </div>
                      <div className="activity-meta">
                        {activity.timeSpent && (
                          <div className="activity-time">
                            <Clock className="w-4 h-4" />
                            {formatPlayTime(activity.timeSpent)}
                          </div>
                        )}
                        {activity.rating && (
                          <div className="activity-rating">
                            {renderStarRating(activity.rating)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Fun Facts */}
          <div className="stats-section">
            <h3 className="stats-section-title">
              <Star className="w-5 h-5" />
              Fun Facts
            </h3>
            <div className="fun-facts">
              {stats.totalAbandoned > 0 && (
                <div className="fun-fact">
                  <Ghost className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <span>You've abandoned {stats.totalAbandoned} adventure{stats.totalAbandoned !== 1 ? 's' : ''} - sometimes retreat is the wisest choice!</span>
                </div>
              )}

              {stats.favoriteCategory && (
                <div className="fun-fact">
                  <Heart className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <span>Your favorite horror category is {stats.favoriteCategory.category} with {stats.favoriteCategory.count} adventure{stats.favoriteCategory.count !== 1 ? 's' : ''}!</span>
                </div>
              )}

              {stats.completionRate === 100 && stats.totalStarted > 1 && (
                <div className="fun-fact">
                  <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <span>Perfect completion rate! You never back down from a challenge!</span>
                </div>
              )}

              {stats.streakData.longestStreak >= 5 && (
                <div className="fun-fact">
                  <Flame className="w-6 h-6 text-orange-400 flex-shrink-0" />
                  <span>Your longest completion streak was {stats.streakData.longestStreak} adventures - impressive dedication!</span>
                </div>
              )}

              {stats.averageRating >= 4.5 && stats.totalRatings >= 3 && (
                <div className="fun-fact">
                  <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <span>You're a generous reviewer with an average rating of {stats.averageRating.toFixed(1)} stars!</span>
                </div>
              )}
            </div>
          </div>

          {/* Reset All Statistics */}
          {onClearHistory && (
            <div className="stats-section">
              <h3 className="stats-section-title">
                <RotateCcw className="w-5 h-5" />
                Reset All Statistics
              </h3>
              <div className="reset-history-card">
                {!showResetConfirm ? (
                  <>
                    <p className="reset-description">
                      Permanently delete ALL your adventure statistics including play times, completion records, streaks, and ratings. This cannot be undone. Story community statistics will remain unaffected.
                    </p>
                    <button 
                      className="reset-history-button"
                      onClick={() => setShowResetConfirm(true)}
                      disabled={isResetting}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Statistics
                    </button>
                  </>
                ) : (
                  <>
                    <p className="reset-description danger">
                      <AlertTriangle className="w-5 h-5 inline mr-2" />
                      This will permanently delete ALL your statistics. Are you sure?
                    </p>
                    <div className="reset-confirm-buttons">
                      <button 
                        className="reset-cancel-button"
                        onClick={() => {
                          setShowResetConfirm(false);
                          handleHoldEnd();
                        }}
                        disabled={isResetting}
                      >
                        Cancel
                      </button>
                      <div className="hold-button-container">
                        <button 
                          className={`reset-confirm-button ${isHolding ? 'holding' : ''}`}
                          onMouseDown={handleHoldStart}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={handleHoldStart}
                          onTouchEnd={handleHoldEnd}
                          disabled={isResetting}
                          style={{
                            background: `linear-gradient(90deg, #dc2626 ${holdProgress}%, #7f1d1d ${holdProgress}%)`
                          }}
                        >
                          {isResetting ? (
                            'Resetting...'
                          ) : isHolding ? (
                            `Hold (${Math.ceil((100 - holdProgress) / 33)}s)`
                          ) : (
                            'Hold to Confirm'
                          )}
                        </button>
                        {holdProgress > 0 && (
                          <div className="hold-progress-bar">
                            <div 
                              className="hold-progress-fill" 
                              style={{ width: `${holdProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};