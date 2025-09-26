import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {Router} from '@angular/router';


export const authInterceptor: HttpInterceptorFn = (
   request: HttpRequest<unknown>,
   next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
   const router = inject(Router);
   const token = localStorage.getItem('token');
   const baseURL = 'http://localhost:8080';
   const protectedRoutes = [`${baseURL}/auth/me`, `${baseURL}/wallet`, `${baseURL}/brokerage`];

   const isProtectedRoute = protectedRoutes.some((url) =>
      request.url.startsWith(url)
   );

   let processedRequest = request;

   if (token && isProtectedRoute) {
      processedRequest = request.clone({
         setHeaders: {
            Authorization: `Bearer ${token}`,
         },
      });
   }

   return next(processedRequest).pipe(
      catchError((error: unknown) => {
         if (error instanceof HttpErrorResponse && error.status === 401) {
            localStorage.removeItem('token');
            router.navigate(['/login']).then(() => {
               window.location.reload();
            });
         }

         return throwError(() => error);
      })
   );
};
