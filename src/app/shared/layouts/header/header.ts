import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserStore } from '../../../stores/user.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'], // <-- แก้ styleUrls (s)
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  readonly auth = inject(AuthService);
  readonly userStore = inject(UserStore);
  constructor(private router: Router) {}

  // default avatar แบบ data URI (ไม่มีวัน 404)
  defaultAvatar = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <rect width="160" height="160" rx="16" fill="#eef2ff"/>
    <circle cx="80" cy="64" r="28" fill="#c7d2fe"/>
    <rect x="28" y="102" width="104" height="40" rx="20" fill="#c7d2fe"/>
  </svg>`);

  imgSrc(p: any) {
    return p?.avatarUrl || this.defaultAvatar;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.onerror = null;                // กันลูป
    img.src = this.defaultAvatar;      // ใช้ fallback ที่ไม่ 404
  }

  logout() {
    this.auth.logout$().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
