import { Injectable } from '@angular/core';
import { Toast } from '../@types/Toast';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
   providedIn: 'root',
})
export class ToastService {
   private toasts$$ = new BehaviorSubject<Toast[]>([]);

   public getToasts(): Observable<Toast[]> {
      return this.toasts$$.asObservable();
   }

   public showSuccess(message: string, duration = 5000): void {
      this.addToast({ message, type: 'success', duration });
   }

   public showError(message: string, duration = 7000): void {
      this.addToast({ message, type: 'error', duration });
   }

   public showInfo(message: string, duration = 5000): void {
      this.addToast({ message, type: 'info', duration });
   }

   private addToast(toast: Omit<Toast, 'id'>): void {
      const newToast: Toast = {
         id: Date.now() + Math.random(),
         ...toast,
      };

      this.toasts$$.next([...this.toasts$$.getValue(), newToast]);

      if (newToast.duration) {
         setTimeout(() => {
            this.removeToast(newToast.id);
         }, newToast.duration);
      }
   }

   public removeToast(id: number): void {
      const updatedToasts = this.toasts$$
         .getValue()
         .filter((toast) => toast.id !== id);
      this.toasts$$.next(updatedToasts);
   }
}
