export interface CreateReview {
   reviewId: string;
   productId: number;
   productCode: string;
   content?: string | null;
   rating: number;
}
