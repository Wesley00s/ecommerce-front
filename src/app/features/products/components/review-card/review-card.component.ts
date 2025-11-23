import {
   Component,
   ElementRef,
   EventEmitter,
   HostListener,
   inject,
   Input,
   Output,
} from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { StarsComponent } from '../../../../shared/components/stars/stars.component';
import { Review } from '../../../../core/@types/Review';
import { OverflowDetectorDirective } from '../../../../directives/overflow-detector';
import { CommentCardComponent } from '../../../../shared/components/comment-card/comment-card.component';
import { CommentState } from '../reviews/reviews.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ReplyFormComponent } from '../../../../shared/components/reply-form/reply-form.component';
import { CommentReactionPayload } from '../../../../core/@types/EventsPayload/CommentReactionPayload';

@Component({
   selector: 'app-review-card',
   imports: [
      NgOptimizedImage,
      StarsComponent,
      DatePipe,
      OverflowDetectorDirective,
      FormsModule,
      CommentCardComponent,
      ReplyFormComponent,
   ],
   templateUrl: './review-card.component.html',
   styleUrl: './review-card.component.sass',
})
export class ReviewCardComponent {
   public readonly INITIAL_COMMENT_LIMIT = 5;

   @Input({ required: true }) review!: Review;
   @Input() commentState: CommentState | undefined;

   @Output() commentDelete = new EventEmitter<CommentReactionPayload>();
   @Output() commentLike = new EventEmitter<CommentReactionPayload>();
   @Output() commentDislike = new EventEmitter<CommentReactionPayload>();
   @Output() like = new EventEmitter<string>();
   @Output() dislike = new EventEmitter<string>();
   @Output() edit = new EventEmitter<Review>();
   @Output() loadComments = new EventEmitter<Review>();
   @Output() showLessComments = new EventEmitter<Review>();
   @Output() toggleComments = new EventEmitter<Review>();
   @Output() submitReply = new EventEmitter<{
      reviewId: string;
      content: string;
      parentCommentId?: string;
   }>();
   @Output() delete = new EventEmitter<string>();

   private authService = inject(AuthService);
   private elementRef = inject(ElementRef);

   public isToolboxOpen = false;

   public isReplying = false;

   public isExpanded = false;
   public contentIsOverflowing = false;
   public isCommentsExpanded = false;
   public replyingToCommentId: string | null = null;
   public mentioningUserName: string | null = null;

   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent): void {
      if (!this.elementRef.nativeElement.contains(event.target)) {
         this.isToolboxOpen = false;
      }
   }

   get isOwner(): boolean {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
         return false;
      }
      return currentUser.id === this.review.customerId;
   }

   toggleToolbox(): void {
      this.isToolboxOpen = !this.isToolboxOpen;
   }

   onEdit(): void {
      this.edit.emit(this.review);
      this.isToolboxOpen = false;
   }

   onDelete(): void {
      this.delete.emit(this.review.reviewId);
      this.isToolboxOpen = false;
   }

   onCommentDelete(commentId: string): void {
      this.commentDelete.emit({
         reviewId: this.review.reviewId,
         commentId: commentId,
      });
   }

   toggleExpand(): void {
      this.isExpanded = !this.isExpanded;
   }

   onOverflowChange(hasOverflow: boolean): void {
      this.contentIsOverflowing = hasOverflow;
   }

   onLike(): void {
      this.like.emit(this.review.reviewId);
   }

   onDislike(): void {
      this.dislike.emit(this.review.reviewId);
   }

   onCommentLike(commentId: string): void {
      this.commentLike.emit({
         reviewId: this.review.reviewId,
         commentId: commentId,
      });
   }

   onCommentDislike(commentId: string): void {
      this.commentDislike.emit({
         reviewId: this.review.reviewId,
         commentId: commentId,
      });
   }

   onToggleComments(): void {
      this.isCommentsExpanded = !this.isCommentsExpanded;

      if (this.isCommentsExpanded) {
         this.toggleComments.emit(this.review);
      }
      this.isReplying = false;
   }

   onLoadMoreComments(): void {
      this.loadComments.emit(this.review);
   }

   onShowLessComments(): void {
      this.showLessComments.emit(this.review);
   }

   onReply(): void {
      this.isReplying = !this.isReplying;
      this.replyingToCommentId = null;
   }

   onCommentReply(event: { commentId: string; customerName: string }): void {
      if (this.replyingToCommentId === event.commentId) {
         this.replyingToCommentId = null;
         this.mentioningUserName = null;
      } else {
         this.replyingToCommentId = event.commentId;
         this.mentioningUserName = event.customerName.replace(/\s+/g, '');
         this.isReplying = false;
      }
   }

   handleReplySubmission(content: string): void {
      this.submitReply.emit({
         reviewId: this.review.reviewId,
         content: content,
      });
      this.isReplying = false;
   }

   handleCommentReplySubmission(content: string): void {
      if (!this.replyingToCommentId) return;

      this.submitReply.emit({
         reviewId: this.review.reviewId,
         content: content,
         parentCommentId: this.replyingToCommentId,
      });

      this.replyingToCommentId = null;
      this.mentioningUserName = null;
   }

   handleCancelReply(): void {
      this.isReplying = false;
      this.replyingToCommentId = null;
      this.mentioningUserName = null;
   }
}
