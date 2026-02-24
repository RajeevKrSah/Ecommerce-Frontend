export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  order_item_id?: number;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  approved_at?: string;
  approved_by?: number;
  helpful_count: number;
  not_helpful_count: number;
  admin_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  rejection_reason?: string;
  reviewer_name?: string;
  reviewer_email?: string;
  created_at: string;
  updated_at: string;
  helpfulness_score: number;
  time_ago: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
    price?: number;
  };
  order?: {
    id: number;
    order_number: string;
    status: string;
  };
  user_vote?: 'helpful' | 'not_helpful' | null;
}

export interface ReviewStatistics {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: {
      count: number;
      percentage: number;
    };
  };
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  order_id?: number;
}

export interface ReviewFilters {
  sort_by?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  rating?: number;
  verified_only?: boolean;
  per_page?: number;
  page?: number;
}

export interface ReviewEligibility {
  can_review: boolean;
  has_purchased: boolean;
  reason?: 'not_logged_in' | 'already_reviewed' | null;
}

export interface AdminReviewFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  rating?: number;
  product_id?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface AdminReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  average_rating: number;
  verified_purchases: number;
}
