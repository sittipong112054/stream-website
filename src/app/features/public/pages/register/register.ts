import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  // เก็บไฟล์กับพรีวิว
  avatarFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);

  // ฟอร์ม
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
    this.avatarFile.set(file);

    // พรีวิวรูป
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.avatarPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.avatarPreview.set(null);
    }
  }

  async submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    try {
      const { username, email, password } = this.form.value;

      // TODO: อัปโหลดไฟล์จริงผ่าน API/Firebase Storage
      // ตอนนี้เดโม: ใช้ dataURL ชั่วคราวแทน URL รูปจาก storage
      const avatarDataUrl = this.avatarPreview();

      // ปกติจะ call API register → ได้ user + token กลับมา
      // ที่นี่เดโม: แค่สร้างบัญชี user ฝั่ง mock แล้วส่งไปหน้า login
      // คุณอาจทำ this.auth.register$(...).subscribe(...)
      // หรือบันทึกใน localStorage (mock) ตามที่ทีมกำหนด
      // ตัวอย่างสั้น ๆ:
      const ok = !!username && !!email && !!password; // แทน API จริง
      if (!ok) throw new Error('ลงทะเบียนไม่สำเร็จ');

      // คุณอาจเก็บ draft user ไว้ใน localStorage ก็ได้ เช่น:
      // localStorage.setItem('draft_user', JSON.stringify({ username, email, avatar: avatarDataUrl }))

      // เมื่อสมัครสำเร็จ → ไปหน้า login
      this.router.navigate(['/login'], { queryParams: { registered: 1 } });
    } catch (err: any) {
      this.errorMsg.set(err?.message ?? 'ลงทะเบียนไม่สำเร็จ');
    } finally {
      this.loading.set(false);
    }
  }
}