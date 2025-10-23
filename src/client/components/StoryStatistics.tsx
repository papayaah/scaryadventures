import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, TrendingUp, Star, Clock } from 'lucide-react';
import { StoryStatistics as StoryStatisticsType, formatPlayTime } from '../../shared/types/api';

type StoryStatisticsProps = {
  storyId: string;
  storyTitle: string;
};

export const StoryStatistics: React.FC<StoryStatisticsProps> = ({ storyId, storyTitle }) => {
  const [stats, setStats] = useState<StoryStatisticsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [storyId]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${storyId}/statistics`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading story statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-statistics">
        <h3 className="stats-title">Adventure Statistics</h3>
        <div className="stats-loading">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="story-statistics">
      <h3 className="stats-title">Adventure Statistics</h3>
      <p className="stats-subtitle">See how others fared in "{storyTitle}"</p>
      
      <div className="stats-grid-compact">
        <div className="stat-item-compact">
          <div className="stat-icon-compact">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="stat-details-compact">
            <div className="stat-value-compact">{stats.totalPlayed}</div>
            <div className="stat-label-compact">{stats.totalPlayed === 1 ? 'Adventurer' : 'Adventurers'}</div>
          </div>
        </div>

        <div className="stat-item-compact">
          <div className="stat-icon-compact">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="stat-details-compact">
            <div className="stat-value-compact">{stats.totalCompleted}</div>
            <div className="stat-label-compact">Completed</div>
          </div>
        </div>

        <div className="stat-item-compact">
          <div className="stat-icon-compact">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="stat-details-compact">
            <div className="stat-value-compact">{stats.totalAbandoned}</div>
            <div className="stat-label-compact">Abandoned</div>
          </div>
        </div>

        <div className="stat-item-compact">
          <div className="stat-icon-compact">
            <TrendingUp className={`w-5 h-5 ${getCompletionColor(stats.completionRate)}`} />
          </div>
          <div className="stat-details-compact">
            <div className={`stat-value-compact ${getCompletionColor(stats.completionRate)}`}>
              {stats.completionRate}%
            </div>
            <div className="stat-label-compact">Completion</div>
          </div>
        </div>

        {stats.totalRatings > 0 && (
          <div className="stat-item-compact">
            <div className="stat-icon-compact">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="stat-details-compact">
              <div className="stat-value-compact">{stats.averageRating.toFixed(1)}</div>
              <div className="stat-label-compact">{stats.totalRatings} Ratings</div>
            </div>
          </div>
        )}

        {stats.totalPlayTime > 0 && (
          <div className="stat-item-compact">
            <div className="stat-icon-compact">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div className="stat-details-compact">
              <div className="stat-value-compact">{formatPlayTime(stats.totalPlayTime)}</div>
              <div className="stat-label-compact">Total Time</div>
            </div>
          </div>
        )}

        {stats.averagePlayTime > 0 && (
          <div className="stat-item-compact">
            <div className="stat-icon-compact">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="stat-details-compact">
              <div className="stat-value-compact">{formatPlayTime(stats.averagePlayTime)}</div>
              <div className="stat-label-compact">Avg. Time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
