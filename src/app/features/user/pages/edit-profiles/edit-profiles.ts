import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, firstValueFrom } from 'rxjs';
import { UserStore } from '../../../../stores/user.store';
import { UserService } from '../../../../core/services/user';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profiles.html',   // ← ให้ตรงกับไฟล์ HTML ที่ทำใหม่
  styleUrls: ['./edit-profiles.scss'],   // ← ให้ตรงกับไฟล์ SCSS ที่ทำใหม่
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfile {
  private fb = inject(FormBuilder);
  private userStore = inject(UserStore);
  private userService = inject(UserService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // --- สถานะ/สัญญาณแบบหน้า Register ---
  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);
  loading = signal(false);
  errorMsg = signal<string | null>(null);

  profile$ = this.userStore.profile$;

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  // ช่วยให้ใช้ในเทมเพลตแบบ f.displayName ได้
  get f() { return this.form.controls; }

  // SVG fallback เมื่อไม่มีรูป
  defaultAvatar =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
         <rect width="160" height="160" rx="16" fill="#eef2ff"/>
         <circle cx="80" cy="64" r="28" fill="#c7d2fe"/>
         <rect x="28" y="102" width="104" height="40" rx="20" fill="#c7d2fe"/>
       </svg>`
    );

  // ใช้ใน <img (error)>
  onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.src = this.defaultAvatar;
  }

  ngOnInit() {
    // กัน null เวลาตั้งค่าเริ่มต้นจาก store
    const p = this.userStore.getProfile?.();
    if (p) {
      this.form.patchValue({
        displayName: p.displayName ?? '',
        email: p.email ?? '',
      });
    }
  }

  // เหมือน Register: ตรวจชนิด/ขนาดไฟล์ + พรีวิว
  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.errorMsg.set('อนุญาตเฉพาะไฟล์รูปภาพ');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg.set('ไฟล์ใหญ่เกิน 5MB');
        input.value = '';
        return;
      }
    }

    this.avatarFile.set(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.avatarPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.avatarPreview.set(null);
    }
  }

  // บันทึกข้อมูลโปรไฟล์ (ชื่อแสดง/อีเมล)
  saveProfile() {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.loading.set(true);

    this.userService.updateMe({
      username: v.displayName!,   // backend ใช้ชื่อ field เป็น username
      email: v.email!,
    }).subscribe({
      next: () => {
        // อัปเดต store ให้ UI สดใหม่ (ไม่ต้องรอรีเฟรช)
        this.userStore.setProfile({
          displayName: v.displayName!,
          email: v.email!,
        });
        alert('Profile updated ✅');
      },
      error: (err: unknown) => {
        console.error('[updateMe] error', err);
        this.errorMsg.set('เกิดข้อผิดพลาดในการบันทึกโปรไฟล์');
      },
      complete: () => this.loading.set(false),
    });
  }

  // อัปโหลดอวาตาร์ด้วยไฟล์จาก signal
  uploadAvatar() {
    const file = this.avatarFile();
    if (!file) return alert('กรุณาเลือกรูปก่อน');

    this.loading.set(true);
    this.userService.uploadMyAvatar(file)
      .pipe(switchMap(() => this.auth.me$()))
      .subscribe({
        next: (profile) => {
          if (!profile) return; // กัน null
          this.userStore.setProfile({
            id: profile.id,
            displayName: profile.displayName,
            email: profile.email,
            walletBalance: profile.walletBalance ?? 0,
            avatarUrl: profile.avatarUrl ? `${profile.avatarUrl}?_=${Date.now()}` : null,
          });
          // รีเซ็ตสถานะไฟล์/พรีวิว
          this.avatarPreview.set(null);
          this.avatarFile.set(null);
          alert('Avatar updated ✅');
        },
        error: (err) => {
          console.error('[uploadMyAvatar] error', err);
          this.errorMsg.set('อัปโหลดรูปไม่สำเร็จ');
        },
        complete: () => this.loading.set(false),
      });
  }

  // ลบอวาตาร์
  removeAvatar() {
    if (!confirm('Remove your avatar?')) return;
    this.loading.set(true);
    this.userService.deleteMyAvatar().subscribe({
      next: () => {
        this.userStore.setProfile({ avatarUrl: null });
        this.avatarPreview.set(null);
        this.avatarFile.set(null);
        alert('Avatar removed ✅');
      },
      error: (err: unknown) => {
        console.error('[deleteMyAvatar] error', err);
        this.errorMsg.set('ลบรูปไม่สำเร็จ');
      },
      complete: () => this.loading.set(false),
    });
  }

  back() {
    this.router.navigate(['/user/profile']);
  }
}
