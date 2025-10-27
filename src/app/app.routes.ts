import { Routes } from '@angular/router';

import { Login } from './features/public/pages/login/login';
import { Register } from './features/public/pages/register/register';
import { Store } from './features/public/pages/store/store';
import { GameDetail } from './features/public/pages/game-detail/game-detail';

import { Library } from './features/user/pages/library/library';
import { CheckoutSuccess } from './features/user/pages/checkout-success/checkout-success';

import { Dashboard } from './features/admin/pages/dashboard/dashboard';

import { Coupons } from './features/admin/pages/coupons/coupons';
import { Transactions } from './features/admin/pages/transactions/transactions';
import { Ranking } from './features/admin/pages/ranking/ranking';

import { NotFound } from './features/public/pages/not-found/not-found';
import { authGuard, loginGuard } from './core/guards/auth-guard';
import { PublicLayout } from './shared/public-layout/public-layout';
import { StoreLayout } from './shared/store-layout/store-layout';
import { ProfilePage } from './features/user/pages/profile/profile';
import { EditProfile } from './features/user/pages/edit-profiles/edit-profiles';
import { AdminGamesPage } from './features/admin/pages/games/games';
import { CartPage } from './features/public/pages/cart/cart';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        component: StoreLayout,
        children: [
          { path: '', redirectTo: 'store', pathMatch: 'full' },
          { path: 'store', component: Store },
          { path: 'games/:id', component: GameDetail },
          { path: 'cart', component: CartPage },
        ],
      },

      { path: 'login', component: Login, canActivate: [loginGuard] },
      { path: 'register', component: Register, canActivate: [loginGuard] },

      {
        path: 'user',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        data: { roles: ['USER'] },
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          { path: 'library', component: Library },
          { path: 'profile', component: ProfilePage },
          { path: 'checkout/success', component: CheckoutSuccess },
          { path: 'edit-profiles', component: EditProfile },
        ],
      },

      {
        path: 'admin',
        canActivate: [authGuard],
        canActivateChild: [authGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', redirectTo: 'games', pathMatch: 'full' },
          { path: 'games', component: AdminGamesPage },
          { path: 'coupons', component: Coupons },
          { path: 'transactions', component: Transactions },
          { path: 'ranking', component: Ranking },
        ],
      },

      { path: 'not-found', component: NotFound },
    ],
  },

  { path: '**', redirectTo: 'not-found' },
];
