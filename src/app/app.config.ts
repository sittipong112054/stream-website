// src/app/app.config.ts

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth';
import { firstValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { UserStore } from './stores/user.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // ✅ ใช้ APP_INITIALIZER (ตัวจริง) และไม่ให้ bootstrap ค้างถ้า /me error
{
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: () => {
    const auth = inject(AuthService);
    const userStore = inject(UserStore);
    return () => firstValueFrom(
      auth.me$().pipe(
        tap(profile => { if (profile) userStore.setProfile(profile); }),
        catchError(() => of(null))
      )
    );
  }
},
  ],
};
