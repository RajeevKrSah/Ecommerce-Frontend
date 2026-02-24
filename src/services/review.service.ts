import api from '@/lib/api';
import { Review, ReviewStatistics, ReviewFormData, ReviewFilters, ReviewEligibility } from '@/types/review';

export const reviewService = {
  // Get reviews for a product
  async getProductReviews(productId: number, filters?: ReviewFilters) {
    const params = new URLSearchParams();
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.verified_only) params.append('verified_only', 'true');
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await api.get(`/products/${productId}/reviews?${params.toString()}`);
    return response.data;
  },

  // Get review statistics for a product
  async getReviewStatistics(productId: number): Promise<{ success: boolean; statistics: ReviewStatistics }> {
    const response = await api.get(`/products/${productId}/reviews/statistics`);
    return response.data;
  },

  // Create a new review
  async createReview(productId: number, data: ReviewFormData): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Update a review
  async updateReview(reviewId: number, data: Partial<ReviewFormData>): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  async deleteReview(reviewId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful/not helpful
  async markHelpful(reviewId: number, isHelpful: boolean): Promise<{ success: boolean; message: string; helpful_count: number; not_helpful_count: number }> {
    const response = await api.post(`/reviews/${reviewId}/helpful`, { is_helpful: isHelpful });
    return response.data;
  },

  // Get user's review for a product
  async getUserReview(productId: number): Promise<{ success: boolean; review: Review | null; can_review: boolean; has_purchased: boolean }> {
    const response = await api.get(`/products/${productId}/reviews/user`);
    return response.data;
  },

  // Check if user can review a product
  async canReview(productId: number): Promise<{ success: boolean } & ReviewEligibility> {
    const response = await api.get(`/products/${productId}/reviews/can-review`);
    return response.data;
  },
};
