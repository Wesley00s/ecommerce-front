export interface CreateComment {
   content: string;
   parentCommentId?: string | null;
   mentionedUserId?: string | null;
   mentionedUserName?: string | null;
}
