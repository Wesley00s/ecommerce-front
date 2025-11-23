export interface Comment {
   commentId: string;
   customerId: string;
   customerName: string;
   content: string;
   parentCommentId?: string | null;
   mentionedUserId?: string | null;
   mentionedUserName?: string | null;
   likes: number;
   dislikes: number;
   totalReplies: number;
   createdAt: string;
   likedByMe: boolean;
   dislikedByMe: boolean;
}
