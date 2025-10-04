import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Role } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // ฟอร์ม: อีเมล + รหัสผ่าน + (ออปชัน) บทบาท
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['USER' as Role], // สำหรับเดโม; ต่อ API จริงค่อยตัดออก
  });

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  get f() { return this.form.controls; }

  async submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password, role } = this.form.value;

    try {
      // mock login; ต่อ API จริงค่อยเปลี่ยนเป็น await this.auth.login$(...).toPromise()
      const ok = this.auth.login(email!, password!, role!);
      if (!ok) throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

      // นำทางตามบทบาท
      const r = this.auth.role();
      if (r === 'ADMIN') this.router.navigate(['/admin']);
      else this.router.navigate(['/user']);
    } catch (err: any) {
      this.errorMsg.set(err?.message ?? 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      this.loading.set(false);
    }
  }
}