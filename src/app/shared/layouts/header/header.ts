import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../stores/user.store';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  readonly auth = inject(AuthService);
  readonly user = inject(UserStore);
  constructor(private router: Router) { }
  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}