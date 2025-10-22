import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

type RatingType = 'like' | 'dislike';

type RatingData = {
  likes: number;
  dislikes: number;
  userRating?: RatingType;
};

type StoryRatingProps = {
  storyId: string;
  storyTitle: string;
};

export const StoryRating: React.FC<StoryRatingProps> = ({ storyId, storyTitle }) => {
  const [ratings, setRatings] = useState<RatingData>({ likes: 0, dislikes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial ratings
  useEffect(() => {
    loadRatings();
  }, [storyId]);

  const loadRatings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stories/${storyId}/ratings`);
      if (response.ok) {
        const data = await response.json();
        setRatings(data);
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: RatingType) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // If user clicks the same rating they already have, remove it
      if (ratings.userRating === rating) {
        const response = await fetch(`/api/stories/${storyId}/rating`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const data = await response.json();
          setRatings({
            likes: data.likes,
            dislikes: data.dislikes,
            userRating: undefined
          });
        }
      } else {
        // Submit new rating
        const response = await fetch(`/api/stories/${storyId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating }),
        });

        if (response.ok) {
          const data = await response.json();
          setRatings({
            likes: data.likes,
            dislikes: data.dislikes,
            userRating: rating
          });
        }
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="story-rating loading">
        <div className="rating-title">
          <h3>How was "{storyTitle}"?</h3>
        </div>
        <div className="rating-buttons">
          <div className="rating-loading">Loading ratings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="story-rating">
      <div className="rating-title">
        <h3>How was "{storyTitle}"?</h3>
        <p>Help other adventurers by rating this tale</p>
      </div>
      
      <div className="rating-buttons">
        <button
          className={`rating-button like-button ${ratings.userRating === 'like' ? 'active' : ''}`}
          onClick={() => handleRating('like')}
          disabled={isSubmitting}
        >
          <ThumbsUp className="rating-icon" />
          <span className="rating-count">{ratings.likes}</span>
          <span className="rating-label">Liked it!</span>
        </button>

        <button
          className={`rating-button dislike-button ${ratings.userRating === 'dislike' ? 'active' : ''}`}
          onClick={() => handleRating('dislike')}
          disabled={isSubmitting}
        >
          <ThumbsDown className="rating-icon" />
          <span className="rating-count">{ratings.dislikes}</span>
          <span className="rating-label">Not for me</span>
        </button>
      </div>

      {ratings.userRating && (
        <p className="rating-feedback">
          Thanks for your feedback! Click again to remove your rating.
        </p>
      )}
    </div>
  );
};