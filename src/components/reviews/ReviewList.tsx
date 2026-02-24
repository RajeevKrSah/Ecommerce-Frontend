'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, ShieldCheck, Flag } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { Review, ReviewFilters } from '@/types/review';
import { reviewService } from '@/services/review.service';
import { useAuth } from '@/hooks/useAuth';

interface ReviewListProps {
  productId: number;
  initialFilters?: ReviewFilters;
}

export default function ReviewList({ productId, initialFilters }: ReviewListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters || { sort_by: 'recent' });

  useEffect(() => {
    loadReviews();
  }, [productId, filters, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getProductReviews(productId, {
        ...filters,
        page: currentPage,
      });

      if (response.success) {
        setReviews(response.reviews.data);
        setTotalPages(response.reviews.last_page);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: number, isHelpful: boolean) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await reviewService.markHelpful(reviewId, isHelpful);
      if (response.success) {
        // Update the review in the list
        setReviews(reviews.map(review => 
          review.id === reviewId
            ? {
                ...review,
                helpful_count: response.helpful_count,
                not_helpful_count: response.not_helpful_count,
                user_vote: isHelpful ? 'helpful' : 'not_helpful',
              }
            : review
        ));
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>

          <select
            value={filters.rating || ''}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.verified_only || false}
            onChange={(e) => setFilters({ ...filters, verified_only: e.target.checked })}
            className="rounded"
          />
          Verified Purchases Only
        </label>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                  {review.is_featured && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <Flag className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900">{review.title}</h4>
              </div>
              <span className="text-sm text-gray-500">{review.time_ago}</span>
            </div>

            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span className="font-medium">{review.reviewer_name || review.user?.name || 'Anonymous'}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(review.id, true)}
                  disabled={!user}
                  className={`flex items-center gap-1 text-sm ${
                    review.user_vote === 'helpful'
                      ? 'text-green-600 font-medium'
                      : 'text-gray-600 hover:text-green-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful_count})</span>
                </button>

                <button
                  onClick={() => handleHelpful(review.id, false)}
                  disabled={!user}
                  className={`flex items-center gap-1 text-sm ${
                    review.user_vote === 'not_helpful'
                      ? 'text-red-600 font-medium'
                      : 'text-gray-600 hover:text-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>({review.not_helpful_count})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
