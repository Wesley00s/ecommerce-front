import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environment/enviroment';
import { HttpClient, HttpContext } from '@angular/common/http';
import { User } from '../@types/User';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { MessageResponse } from '../@types/MessageResponse';
import { Auth } from '../@types/Auth';
import { SKIP_AUTH_REDIRECT } from '../tokens/auth.context';

@Injectable({
   providedIn: 'root',
})
export class AuthService {
   private readonly apiUrl = `${environment.apiUrl}/ecommerce/api/v1/auth`;
   private http = inject(HttpClient);

   currentUser = signal<User | null>(null);
   isLogged = computed(() => !!this.currentUser());

   userInitials = computed(() => {
      const user = this.currentUser();
      if (!user || !user.name) return '';
      const parts = user.name.trim().split(' ');
      if (parts.length === 0) return '';

      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
   });

   save(user: User): Observable<MessageResponse> {
      return this.http.post<MessageResponse>(`${this.apiUrl}/register`, user);
   }

   authenticate(auth: Auth): Observable<User> {
      return this.http.post<User>(`${this.apiUrl}/login`, auth).pipe(
         tap((user) => {
            this.currentUser.set(user);
         }),
         catchError((err) => {
            this.currentUser.set(null);
            return throwError(() => err);
         }),
      );
   }

   logout(): Observable<void> {
      return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
         tap(() => {
            this.currentUser.set(null);
         }),
         catchError((err) => {
            this.currentUser.set(null);
            return throwError(() => err);
         }),
      );
   }

   getAuthenticatedUser(): Observable<User | null> {
      return this.http
         .get<User>(`${this.apiUrl}/me`, {
            context: new HttpContext().set(SKIP_AUTH_REDIRECT, true),
         })
         .pipe(
            tap((user) => {
               this.currentUser.set(user);
            }),
            catchError((err) => {
               this.currentUser.set(null);
               return throwError(() => err);
            }),
         );
   }
}
