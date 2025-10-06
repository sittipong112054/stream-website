import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStore } from '../../../../stores/user.store';
import { UserService } from '../../../../core/services/user';
import { AuthService } from '../../../../core/services/auth';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profiles.html',
  styleUrls: ['./edit-profiles.scss'],
})
export class EditProfile {
  private fb = inject(FormBuilder);
  private userStore = inject(UserStore);
  private userService = inject(UserService);
  private router = inject(Router);
  private auth = inject(AuthService);

  preview = signal<string | null>(null);
  file: File | null = null;
  profile$ = this.userStore.profile$;

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  // ใน component
  defaultAvatar =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
     <rect width="160" height="160" rx="16" fill="#eef2ff"/>
     <circle cx="80" cy="64" r="28" fill="#c7d2fe"/>
     <rect x="28" y="102" width="104" height="40" rx="20" fill="#c7d2fe"/>
   </svg>`
    );

  imgSrc(p: any) {
    return this.preview?.() || p?.avatarUrl || this.defaultAvatar;
  }
  onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.defaultAvatar;
  }

  ngOnInit() {
    const p = this.userStore.getProfile();
    if (p) this.form.patchValue({ displayName: p.displayName, email: p.email });
  }

  onFilePick(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.file = f;
    const reader = new FileReader();
    reader.onload = () => this.preview.set(reader.result as string);
    reader.readAsDataURL(f);
  }

  saveProfile() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.userService
      .updateMe({ username: v.displayName!, email: v.email! })
      .subscribe({
        next: () => {
          this.userStore.setProfile({
            displayName: v.displayName!,
            email: v.email!,
          });
          alert('Profile updated ✅');
        },
        error: (err: unknown) => {
          console.error(err);
          alert('Error updating profile');
        },
      });
  }

  uploadAvatar() {
    if (!this.file) return alert('Please choose an image first.');

    this.userService
      .uploadMyAvatar(this.file)
      .pipe(
        switchMap(() => this.auth.me$()) // me$(): Observable<UserProfile | null>
      )
      .subscribe({
        next: (profile) => {
          if (!profile) return; // ✅ กัน null

          this.userStore.setProfile({
            id: profile.id,
            displayName: profile.displayName,
            email: profile.email,
            walletBalance: profile.walletBalance ?? 0,
            avatarUrl: profile.avatarUrl
              ? `${profile.avatarUrl}?_=${Date.now()}`
              : null,
          });

          this.preview.set(null);
          this.file = null;
          alert('Avatar updated ✅');
        },
        error: (err) => {
          console.error(err);
          alert('Upload failed');
        },
      });
  }

  removeAvatar() {
    if (!confirm('Remove your avatar?')) return;
    this.userService.deleteMyAvatar().subscribe({
      next: () => {
        this.userStore.setProfile({ avatarUrl: null });
        this.preview.set(null);
        alert('Avatar removed ✅');
      },
      error: (err: unknown) => {
        console.error(err);
        alert('Remove failed');
      },
    });
  }

  back() {
    this.router.navigate(['/user/profile']);
  }
}
