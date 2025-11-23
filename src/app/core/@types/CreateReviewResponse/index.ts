export interface CreateReviewResponse {
   reviewId: string;
   productId: number;
   customerId: string;
   customerName: string;
   content?: string | null;
   rating: number;
}
