import {
   ApplicationConfig,
   inject,
   provideAppInitializer,
   provideBrowserGlobalErrorListeners,
   Provider,
   provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CookieService } from 'ngx-cookie-service';
import {
   provideHttpClient,
   withFetch,
   withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { lastValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { provideAnimations } from '@angular/platform-browser/animations';
import {provideNgxStripe} from 'ngx-stripe';

const customImageLoader = (config: ImageLoaderConfig) => {
   if (config.src.includes('assets/')) {
      return config.src;
   }

   const params = config.width
      ? `w_${config.width},q_auto,f_auto`
      : 'q_auto,f_auto';

   const cloudinaryBase = 'https://res.cloudinary.com/dytzru3ad/image/upload/';

   if (config.src.startsWith('http')) {
      if (config.src.includes('res.cloudinary.com/dytzru3ad')) {
         return config.src.replace('/upload/', `/upload/${params}/`);
      }
      return config.src;
   }

   const imageName = config.src.startsWith('/')
      ? config.src.substring(1)
      : config.src;

   return `${cloudinaryBase}${params}/${imageName}`;
};

export const customImageLoaderProvider: Provider = {
   provide: IMAGE_LOADER,
   useValue: customImageLoader,
};

export const appConfig: ApplicationConfig = {
   providers: [
      provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
      customImageLoaderProvider,
      provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      CookieService,
      provideNgxStripe('pk_test_51SZGot3lOUpwZ6q44cXYtBZFES4E1dA7prnPhZxFKWMHd6WptQcY0ZvhE9P2BpuLb86hS7L9c7xul4vgcqft3wjY00BT0uIi49'),
      provideAnimations(),
      provideAppInitializer(() => {
         const authService = inject(AuthService);

         return lastValueFrom(
            authService.getAuthenticatedUser().pipe(catchError(() => of(null))),
         );
      }),
   ],
};
