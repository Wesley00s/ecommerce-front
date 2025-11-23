export interface Review {
   reviewId: string;
   productId: string;
   customerId: string;
   likes: number;
   dislikes: number;
   customerName: string;
   content: string;
   rating: number;
   totalComments: number;
   createdAt: string;
   likedByMe: boolean;
   dislikedByMe: boolean;
}
