import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toRelativePath'
})
export class ToRelativePathPipe implements PipeTransform {

   transform(value: string | null | undefined): string {
      if (!value || !value.includes('/upload/')) {
         return '';
      }

      return value.split('/upload/')[1];
   }
}

