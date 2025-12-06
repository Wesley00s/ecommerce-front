import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'mentionHighlighter', standalone: true })
export class MentionHighlighterPipe implements PipeTransform {
   protected sanitizer = inject(DomSanitizer);

   transform(value: string): SafeHtml {
      const mentionRegex = /(@[\p{L}\w]+)/gu;
      const highlightedText = value.replace(
         mentionRegex,
         `<strong class="text-orange-600">$1</strong>`,
      );
      return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
   }
}
