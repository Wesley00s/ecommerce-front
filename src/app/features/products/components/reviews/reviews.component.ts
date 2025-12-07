import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
   catchError,
   filter,
   map,
   Observable,
   of,
   Subject,
   Subscription,
   switchMap,
   take,
   tap,
} from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import {
   ReviewsService,
   ReviewsState,
} from '../../../../core/services/reviews.service';

import { Review } from '../../../../core/@types/Review';
import { Comment } from '../../../../core/@types/Comment';
import { CreateReview } from '../../../../core/@types/CreateReview';
import { ReviewParams } from '../../../../core/@types/ReviewParams';
import { CreateComment } from '../../../../core/@types/CreateComment';

import { ReviewCardComponent } from '../review-card/review-card.component';
import { ErrorContainerComponent } from '../../../../shared/components/error-container/error-container.component';
import { CreateReviewButtonComponent } from '../../../../shared/components/create-review-button/create-review-button.component';
import {
   CreateReviewModalComponent,
   ReviewData,
} from '../../../../shared/components/create-review-modal/create-review-modal.component';
import { AlertModalComponent } from '../../../../shared/components/alert-modal/alert-modal/alert-modal.component';
import { CommentReactionPayload } from '../../../../core/@types/EventsPayload/CommentReactionPayload';
import { ToastService } from '../../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

export interface CommentState {
   comments: Comment[];
   skip: number;
   limit: number;
   total: number;
   loading: boolean;
   hasMore: boolean;
}

interface ReactionSnapshot {
   likes: number;
   dislikes: number;
   likedByMe: boolean;
   dislikedByMe: boolean;
}

@Component({
   selector: 'app-reviews',
   imports: [
      ReviewCardComponent,
      AsyncPipe,
      ErrorContainerComponent,
      CreateReviewButtonComponent,
      NgOptimizedImage,
      CreateReviewModalComponent,
      AlertModalComponent,
      LoadingSpinnerComponent,
   ],
   templateUrl: './reviews.component.html',
   styleUrl: './reviews.component.sass',
})
export class ReviewsComponent implements OnInit, OnDestroy {
   private readonly INITIAL_COMMENT_LIMIT = 5;

   @Input({ required: true }) productCode!: string;

   protected reviewsService = inject(ReviewsService);
   protected toastService = inject(ToastService);
   private breakpointObserver = inject(BreakpointObserver);

   isModalOpen = false;
   isDeleteModalOpen = false;
   itemToDelete: {
      type: 'review' | 'comment';
      reviewId: string;
      commentId?: string;
   } | null = null;

   commentsMap = new Map<string, CommentState>();
   protected isMobile = false;

   protected filterParams: ReviewParams = {
      sortField: 'createdAt',
      direction: 'DESC',
      page: 0,
      size: this.INITIAL_COMMENT_LIMIT,
   };

   protected sortOptions = [
      { label: 'Mais Recentes', value: 'createdAt.DESC' },
      { label: 'Mais Antigos', value: 'createdAt.ASC' },
      { label: 'Maior Nota', value: 'rating.DESC' },
      { label: 'Menor Nota', value: 'rating.ASC' },
   ];

   reviewsState$: Observable<ReviewsState> = this.reviewsService.reviewsState$;
   private reactionAction = new Subject<{
      reviewId: string;
      commentId?: string | null;
      isLike: boolean;
   }>();

   private subscriptions = new Subscription();

   ngOnInit(): void {
      this.subscriptions.add(
         this.breakpointObserver
            .observe(Breakpoints.XSmall)
            .pipe(map((result) => result.matches))
            .subscribe((isMobile) => (this.isMobile = isMobile)),
      );

      this.handleReactions();
      this.fetchReviews();
   }

   ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
   }

   fetchReviews(): void {
      this.reviewsService.getReviewsByProduct(
         this.productCode,
         this.filterParams,
      );
   }

   private handleReactions(): void {
      this.subscriptions.add(
         this.reactionAction
            .pipe(
               switchMap(({ reviewId, commentId, isLike }) => {
                  const backupState = this.snapshotReactionState(
                     reviewId,
                     commentId,
                  );

                  this.updateLocalReactionState(reviewId, commentId, isLike);

                  const reaction$ = commentId
                     ? this.reviewsService.reactToComment(
                          reviewId,
                          commentId,
                          isLike,
                       )
                     : this.reviewsService.reactToReview(reviewId, isLike);

                  return reaction$.pipe(
                     catchError(() => {
                        this.restoreReactionState(
                           reviewId,
                           commentId,
                           backupState,
                        );
                        this.toastService.showError(
                           'Não foi possível registrar sua reação.',
                        );
                        return of(null);
                     }),
                  );
               }),
            )
            .subscribe(),
      );
   }

   private updateLocalReactionState(
      reviewId: string,
      commentId: string | undefined | null,
      isLikeAction: boolean,
   ): void {
      const target = this.findTargetItem(reviewId, commentId);
      if (!target) return;

      if (isLikeAction) {
         if (target.likedByMe) {
            target.likedByMe = false;
            target.likes--;
         } else {
            target.likedByMe = true;
            target.likes++;

            if (target.dislikedByMe) {
               target.dislikedByMe = false;
               target.dislikes--;
            }
         }
      } else {
         if (target.dislikedByMe) {
            target.dislikedByMe = false;
            target.dislikes--;
         } else {
            target.dislikedByMe = true;
            target.dislikes++;

            if (target.likedByMe) {
               target.likedByMe = false;
               target.likes--;
            }
         }
      }
   }

   private findTargetItem(
      reviewId: string,
      commentId?: string | null,
   ): ReactionSnapshot | null {
      const review = this.reviewsService.currentState.reviews.data.find(
         (r) => r.reviewId === reviewId,
      );

      if (!review) return null;

      if (commentId) {
         const commentState = this.commentsMap.get(reviewId);
         return (
            commentState?.comments.find((c) => c.commentId === commentId) ||
            null
         );
      }

      return review;
   }

   private snapshotReactionState(
      reviewId: string,
      commentId?: string | null,
   ): ReactionSnapshot | null {
      const item = this.findTargetItem(reviewId, commentId);
      if (!item) return null;

      return {
         likes: item.likes,
         dislikes: item.dislikes,
         likedByMe: item.likedByMe,
         dislikedByMe: item.dislikedByMe,
      };
   }

   private restoreReactionState(
      reviewId: string,
      commentId: string | undefined | null,
      snapshot: ReactionSnapshot | null,
   ): void {
      if (!snapshot) return;
      const item = this.findTargetItem(reviewId, commentId);

      if (item) {
         item.likes = snapshot.likes;
         item.dislikes = snapshot.dislikes;
         item.likedByMe = snapshot.likedByMe;
         item.dislikedByMe = snapshot.dislikedByMe;
      }
   }

   handleShowLessComments(review: Review): void {
      const commentState = this.commentsMap.get(review.reviewId);
      if (
         commentState &&
         commentState.comments.length > this.INITIAL_COMMENT_LIMIT
      ) {
         const slicedComments = commentState.comments.slice(
            0,
            this.INITIAL_COMMENT_LIMIT,
         );

         const newMap = new Map(this.commentsMap);
         newMap.set(review.reviewId, {
            ...commentState,
            comments: slicedComments,
            hasMore: true,
         });
         this.commentsMap = newMap;
      }
   }

   loadComments(review: Review): void {
      const reviewId = review.reviewId;
      let currentState = this.commentsMap.get(reviewId);

      if (!currentState) {
         currentState = {
            comments: [],
            skip: 0,
            limit: 5,
            total: review.totalComments,
            loading: false,
            hasMore: true,
         };
      }

      if (currentState.loading || !currentState.hasMore) return;

      currentState.loading = true;
      const loadingMap = new Map(this.commentsMap);
      loadingMap.set(reviewId, { ...currentState });
      this.commentsMap = loadingMap;

      this.reviewsService
         .getCommentsByReview(reviewId, currentState.skip, currentState.limit)
         .subscribe((newComments) => {
            const allComments = [
               ...(currentState?.comments || []),
               ...newComments,
            ];

            const newMap = new Map(this.commentsMap);
            newMap.set(reviewId, {
               ...currentState!,
               comments: allComments,
               skip: allComments.length,
               loading: false,
               hasMore: allComments.length < currentState!.total,
            });
            this.commentsMap = newMap;
         });
   }

   handleToggleComments(review: Review): void {
      const newMap = new Map(this.commentsMap);
      newMap.delete(review.reviewId);
      this.commentsMap = newMap;

      this.loadComments(review);
   }

   private reloadCommentsForReview(reviewId: string): void {
      const targetReview = this.reviewsService.currentState.reviews.data.find(
         (r) => r.reviewId === reviewId,
      );

      if (targetReview) {
         this.handleToggleComments(targetReview);
      }
   }

   handleLike(reviewId: string): void {
      this.reactionAction.next({ reviewId, isLike: true });
   }

   handleDislike(reviewId: string): void {
      this.reactionAction.next({ reviewId, isLike: false });
   }

   handleSubmitReview(formData: ReviewData): void {
      const payload: Partial<CreateReview> = {
         productCode: this.productCode,
         content: formData.content,
         rating: formData.rating,
      };

      this.reviewsService
         .createReview(payload as CreateReview)
         .subscribe(() => {
            this.closeReviewModal();
            this.fetchReviews();
         });
   }

   handleSubmittedReply(event: { reviewId: string; content: string }): void {
      const payload = {
         content: event.content,
         parentCommentId: null,
         mentionedUserId: null,
         mentionedUserName: null,
      } as CreateComment;

      this.reviewsService.createComment(event.reviewId, payload).subscribe({
         next: () => {
            this.toastService.showSuccess('Resposta enviada com sucesso!');
            this.fetchReviews();
            this.reloadCommentsForReview(event.reviewId);
         },
         error: () => {
            this.toastService.showError(`Erro ao enviar resposta.`);
         },
      });
   }

   handleDeleteRequest(reviewId: string): void {
      this.itemToDelete = { type: 'review', reviewId: reviewId };
      this.isDeleteModalOpen = true;
   }

   confirmDelete(): void {
      if (!this.itemToDelete) return;

      if (this.itemToDelete.type === 'review') {
         this.reviewsService
            .deleteReview(this.itemToDelete.reviewId)
            .subscribe(() => {
               this.closeDeleteModal();
               this.fetchReviews();
               this.toastService.showSuccess('Avaliação deletada com sucesso!');
            });
      } else if (
         this.itemToDelete.type === 'comment' &&
         this.itemToDelete.commentId
      ) {
         const reviewId = this.itemToDelete.reviewId;

         this.reviewsService
            .deleteComment(
               this.itemToDelete.reviewId,
               this.itemToDelete.commentId,
            )
            .pipe(
               tap(() => this.fetchReviews()),
               switchMap(() =>
                  this.reviewsService.reviewsState$.pipe(
                     filter((state) => !state.loading),
                     take(1),
                  ),
               ),
            )
            .subscribe(() => {
               this.reloadCommentsForReview(reviewId);
               this.closeDeleteModal();
               this.toastService.showSuccess(
                  'Comentário deletado com sucesso!',
               );
            });
      }
   }

   onSortChange(event: Event): void {
      const select = event.target as HTMLSelectElement;
      const [sortField, direction] = select.value.split('.');
      this.filterParams = {
         ...this.filterParams,
         sortField: sortField as 'createdAt' | 'rating',
         direction: direction as 'ASC' | 'DESC',
         page: 0,
      };
      this.fetchReviews();
   }

   onPageChange(newPage: number): void {
      this.filterParams = { ...this.filterParams, page: newPage };
      this.fetchReviews();
   }

   handleCommentLike(event: CommentReactionPayload): void {
      this.reactionAction.next({ ...event, isLike: true });
   }

   handleCommentDislike(event: CommentReactionPayload): void {
      this.reactionAction.next({ ...event, isLike: false });
   }

   handleCommentDeleteRequest(event: CommentReactionPayload): void {
      this.itemToDelete = {
         type: 'comment',
         reviewId: event.reviewId,
         commentId: event.commentId,
      };
      this.isDeleteModalOpen = true;
   }

   openReviewModal(): void {
      this.isModalOpen = true;
   }

   closeReviewModal(): void {
      this.isModalOpen = false;
   }

   closeDeleteModal(): void {
      this.isDeleteModalOpen = false;
      this.itemToDelete = null;
   }

   getPageNumbers(currentPage: number, totalPages: number): number[] {
      const windowSize = this.isMobile ? 3 : 5;
      if (totalPages <= windowSize) {
         return Array.from({ length: totalPages }, (_, i) => i);
      }
      let startPage = Math.max(0, currentPage - Math.floor(windowSize / 2));
      startPage = Math.min(startPage, totalPages - windowSize);
      return Array.from({ length: windowSize }, (_, i) => startPage + i);
   }

   protected handleReviewEdit() {
      this.toastService.showInfo('Upcoming feature: Edit review.');
   }
}
