// src/main.ts
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { APP_INITIALIZER, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { AuthService } from './app/core/services/auth';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),  // ถ้ามี interceptor จะทำงาน
    provideClientHydration(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        // console.log('[INIT] call /auth/me'); // debug ได้
        return () =>
          firstValueFrom(
            auth.me$().pipe(
              catchError(() => of(null)) // กัน 401/เน็ตหลุดให้บูตต่อได้
            )
          );
      },
    },
  ],
}).catch(err => console.error(err));
