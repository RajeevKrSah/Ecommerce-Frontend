'use client';

import { useState, useEffect } from 'react';
import StarRating from '@/components/ui/StarRating';
import { ReviewStatistics } from '@/types/review';
import { reviewService } from '@/services/review.service';

interface ReviewSummaryProps {
  productId: number;
}

export default function ReviewSummary({ productId }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [productId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getReviewStatistics(productId);
      if (response.success) {
        setStats(response.statistics);
      }
    } catch (error) {
      console.error('Failed to load review statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.average_rating.toFixed(1)}
          </div>
          <StarRating rating={stats.average_rating} size="lg" className="mb-2" />
          <p className="text-gray-600">
            Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const data = stats.rating_distribution[rating] || { count: 0, percentage: 0 };
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-12">
                  {rating} star{rating !== 1 && 's'}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">
                  {data.percentage.toFixed(0)}% ({data.count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
