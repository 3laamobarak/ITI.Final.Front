export interface IReview {
  id: number;
  productId: number;
  productName?: string;
  userId?: string;
  userName?: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: string;
  reviewDate?: string;
  productImage?: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

