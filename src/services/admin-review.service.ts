import adminApi from '@/lib/adminApi';
import { Review, AdminReviewFilters, AdminReviewStats } from '@/types/review';

export const adminReviewService = {
  // Get all reviews with filters
  async getReviews(filters?: AdminReviewFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.product_id) params.append('product_id', filters.product_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await adminApi.get(`/admin/reviews?${params.toString()}`);
    return response.data;
  },

  // Get review statistics
  async getStatistics(): Promise<{ success: boolean; statistics: AdminReviewStats; recent_reviews: Review[] }> {
    const response = await adminApi.get('/admin/reviews/statistics');
    return response.data;
  },

  // Get single review
  async getReview(id: number): Promise<{ success: boolean; review: Review }> {
    const response = await adminApi.get(`/admin/reviews/${id}`);
    return response.data;
  },

  // Approve review
  async approveReview(id: number, notes?: string): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await adminApi.post(`/admin/reviews/${id}/approve`, { notes });
    return response.data;
  },

  // Reject review
  async rejectReview(id: number, reason: string, notes?: string): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await adminApi.post(`/admin/reviews/${id}/reject`, { reason, notes });
    return response.data;
  },

  // Flag review
  async flagReview(id: number, notes?: string): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await adminApi.post(`/admin/reviews/${id}/flag`, { notes });
    return response.data;
  },

  // Toggle featured status
  async toggleFeatured(id: number): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await adminApi.post(`/admin/reviews/${id}/toggle-featured`);
    return response.data;
  },

  // Update admin notes
  async updateNotes(id: number, notes: string): Promise<{ success: boolean; message: string; review: Review }> {
    const response = await adminApi.put(`/admin/reviews/${id}/notes`, { notes });
    return response.data;
  },

  // Delete review
  async deleteReview(id: number): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  // Bulk approve reviews
  async bulkApprove(reviewIds: number[]): Promise<{ success: boolean; message: string; count: number }> {
    const response = await adminApi.post('/admin/reviews/bulk-approve', { review_ids: reviewIds });
    return response.data;
  },

  // Bulk reject reviews
  async bulkReject(reviewIds: number[], reason: string): Promise<{ success: boolean; message: string; count: number }> {
    const response = await adminApi.post('/admin/reviews/bulk-reject', { review_ids: reviewIds, reason });
    return response.data;
  },
};
