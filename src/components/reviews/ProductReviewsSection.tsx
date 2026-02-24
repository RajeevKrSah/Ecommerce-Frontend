'use client';

import { useState, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/hooks/useAuth';
import { reviewService } from '@/services/review.service';

interface ProductReviewsSectionProps {
  productId: number;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkReviewEligibility();
  }, [productId, user]);

  const checkReviewEligibility = async () => {
    if (!user) {
      setCanReview(false);
      setHasPurchased(false);
      return;
    }

    try {
      const response = await reviewService.canReview(productId);
      if (response.success) {
        setCanReview(response.can_review);
        setHasPurchased(response.has_purchased);
      }
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    setCanReview(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of reviews
  };

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <ReviewSummary productId={productId} key={`summary-${refreshKey}`} />

      {/* Write Review Button */}
      {user && canReview && !showForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Write a Review
          </button>
        </div>
      )}

      {/* Review Eligibility Messages */}
      {user && !canReview && !showForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            You have already reviewed this product.
          </p>
        </div>
      )}

      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            Please <a href="/login" className="font-medium underline">login</a> to write a review.
          </p>
        </div>
      )}

      {user && canReview && !hasPurchased && !showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-700">
            You can write a review, but it won't be marked as a verified purchase.
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews List */}
      <div>
        <h3 className="text-2xl font-semibold mb-6">All Reviews</h3>
        <ReviewList productId={productId} key={`list-${refreshKey}`} />
      </div>
    </div>
  );
}
