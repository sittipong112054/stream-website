import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  get f() { return this.form.controls; }

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

  async submit() {
    console.log('[REGISTER] submit() fired'); // <-- LOG เช็คว่าโดนเรียกจริง
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    try {
      const { username, email, password } = this.form.value;
      console.log('[REGISTER] payload', { username, email, hasPassword: !!password, hasFile: !!this.avatarFile() });

      await firstValueFrom(
        this.auth.registerWithAvatar$({
          username: username!, email: email!, password: password!, avatar: this.avatarFile(),
        })
      );

      this.router.navigate(['/login'], { queryParams: { registered: 1 } });
    } catch (err: any) {
      console.error('[REGISTER] error', err);
      this.errorMsg.set(err?.error?.error ?? err?.message ?? 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      this.loading.set(false);
    }
  }
}
