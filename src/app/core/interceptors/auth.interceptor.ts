import {
   HttpErrorResponse,
   HttpEvent,
   HttpHandlerFn,
   HttpInterceptorFn,
   HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environment/enviroment';
import { CookieService } from 'ngx-cookie-service';
import { SKIP_AUTH_REDIRECT } from '../tokens/auth.context';

export const authInterceptor: HttpInterceptorFn = (
   request: HttpRequest<unknown>,
   next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
   const router = inject(Router);
   const cookieService = inject(CookieService);
   const apiUrl = environment.apiUrl;

   let processedRequest = request;

   if (request.url.startsWith(apiUrl)) {
      processedRequest = request.clone({
         withCredentials: true,
      });
   }

   return next(processedRequest).pipe(
      catchError((error: unknown) => {
         if (
            error instanceof HttpErrorResponse &&
            (error.status === 401 || error.status === 403)
         ) {
            if (request.context.get(SKIP_AUTH_REDIRECT)) {
               return throwError(() => error);
            }

            cookieService.delete('token', '/');
            router.navigate(['/sign-in']).then(() => {
               window.location.reload();
            });
         }

         return throwError(() => error);
      }),
   );
};
