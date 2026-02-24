'use client';

import { useState, useEffect } from 'react';
import { Star, ShieldCheck, Flag, Check, X, Eye, Trash2, MessageSquare } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { Review, AdminReviewFilters, AdminReviewStats } from '@/types/review';
import { adminReviewService } from '@/services/admin-review.service';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AdminReviewFilters>({ status: 'pending' });
  const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingReview, setRejectingReview] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [filters, currentPage]);

  const loadStatistics = async () => {
    try {
      const response = await adminReviewService.getStatistics();
      if (response.success) {
        setStats(response.statistics);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await adminReviewService.getReviews({
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

  const handleApprove = async (id: number) => {
    try {
      const response = await adminReviewService.approveReview(id);
      if (response.success) {
        alert(response.message);
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleReject = async () => {
    if (!rejectingReview || !rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await adminReviewService.rejectReview(rejectingReview, rejectReason);
      if (response.success) {
        alert(response.message);
        setShowRejectModal(false);
        setRejectingReview(null);
        setRejectReason('');
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject review');
    }
  };

  const handleFlag = async (id: number) => {
    try {
      const response = await adminReviewService.flagReview(id);
      if (response.success) {
        alert(response.message);
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to flag review');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const response = await adminReviewService.toggleFeatured(id);
      if (response.success) {
        alert(response.message);
        loadReviews();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }

    try {
      const response = await adminReviewService.deleteReview(id);
      if (response.success) {
        alert(response.message);
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to approve');
      return;
    }

    if (!confirm(`Approve ${selectedReviews.length} selected reviews?`)) {
      return;
    }

    try {
      const response = await adminReviewService.bulkApprove(selectedReviews);
      if (response.success) {
        alert(response.message);
        setSelectedReviews([]);
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve reviews');
    }
  };

  const handleBulkReject = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to reject');
      return;
    }

    const reason = prompt('Enter rejection reason:');
    if (!reason) {
      return;
    }

    try {
      const response = await adminReviewService.bulkReject(selectedReviews, reason);
      if (response.success) {
        alert(response.message);
        setSelectedReviews([]);
        loadReviews();
        loadStatistics();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject reviews');
    }
  };

  const toggleSelectReview = (id: number) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-700">Review Management</h1>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
            <div className="text-sm text-green-700">Approved</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rejected</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{stats.flagged}</div>
            <div className="text-sm text-purple-700">Flagged</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{stats.average_rating.toFixed(1)}</div>
            <div className="text-sm text-blue-700">Avg Rating</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-900">{stats.verified_purchases}</div>
            <div className="text-sm text-indigo-700">Verified</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>

          <select
            value={filters.rating || ''}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <input
            type="text"
            placeholder="Search reviews..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg flex-1 min-w-[200px] text-gray-600"
          />
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="flex items-center gap-4 pt-4 border-t">
            <span className="text-sm font-medium">{selectedReviews.length} selected</span>
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Bulk Approve
            </button>
            <button
              onClick={handleBulkReject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Bulk Reject
            </button>
            <button
              onClick={() => setSelectedReviews([])}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === reviews.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reviewer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Review</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => toggleSelectReview(review.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {review.product?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{review.reviewer_name}</div>
                        <div className="text-xs text-gray-500">{review.reviewer_email}</div>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={review.rating} size="sm" />
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">{review.title}</div>
                        <div className="text-sm text-gray-600 truncate">{review.comment}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>👍 {review.helpful_count}</span>
                          <span>👎 {review.not_helpful_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          review.status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {review.status}
                        </span>
                        {review.is_featured && (
                          <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            <Flag className="w-3 h-3" />
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {review.time_ago}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {review.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingReview(review.id);
                                  setShowRejectModal(true);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleFlag(review.id)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(review.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Toggle Featured"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t">
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
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowRejectModal(false);
              setRejectingReview(null);
              setRejectReason('');
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Review
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this review:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingReview(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Reject Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
