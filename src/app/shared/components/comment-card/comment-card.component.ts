import {
   Component,
   ElementRef,
   EventEmitter,
   HostListener,
   inject,
   Input,
   Output,
} from '@angular/core';
import { Comment } from '../../../core/@types/Comment';
import { OverflowDetectorDirective } from '../../../directives/overflow-detector';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MentionHighlighterPipe } from '../../pipes/mention-highlighter.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
   selector: 'app-comment-card',
   imports: [
      OverflowDetectorDirective,
      DatePipe,
      NgOptimizedImage,
      MentionHighlighterPipe,
   ],
   templateUrl: './comment-card.component.html',
   styleUrl: './comment-card.component.sass',
})
export class CommentCardComponent {
   @Input({ required: true }) comment!: Comment;

   @Output() like = new EventEmitter<string>();
   @Output() dislike = new EventEmitter<string>();
   @Output() reply = new EventEmitter<{
      commentId: string;
      customerName: string;
   }>();

   public isExpanded = false;
   public contentIsOverflowing = false;

   toggleExpand(): void {
      this.isExpanded = !this.isExpanded;
   }

   @Output() edit = new EventEmitter<string>();
   @Output() delete = new EventEmitter<string>();

   private authService = inject(AuthService);
   private elementRef = inject(ElementRef);

   public isToolboxOpen = false;

   @HostListener('document:click', ['$event'])
   onDocumentClick(event: MouseEvent): void {
      if (!this.elementRef.nativeElement.contains(event.target)) {
         this.isToolboxOpen = false;
      }
   }

   get isOwner(): boolean {
      const currentUser = this.authService.currentUser();
      return !!currentUser && currentUser.id === this.comment.customerId;
   }

   toggleToolbox(): void {
      this.isToolboxOpen = !this.isToolboxOpen;
   }

   onEdit(): void {
      this.edit.emit(this.comment.content);
      this.isToolboxOpen = false;
   }

   onDelete(): void {
      this.delete.emit(this.comment.commentId);
      this.isToolboxOpen = false;
   }

   onOverflowChange(hasOverflow: boolean): void {
      this.contentIsOverflowing = hasOverflow;
   }

   onLike(): void {
      this.like.emit(this.comment.commentId);
   }

   onDislike(): void {
      this.dislike.emit(this.comment.commentId);
   }

   onReply(): void {
      this.reply.emit({
         commentId: this.comment.commentId,
         customerName: this.comment.customerName,
      });
   }
}
