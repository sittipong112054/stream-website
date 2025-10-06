import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  get f() {
    return this.form.controls;
  }

  submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);

    const { email, password } = this.form.value;

    this.auth.login$(email!, password!).subscribe({
      next: () => {
        // ดึงโปรไฟล์เข้าร้าน (header/profile จะได้รูป/ชื่อ/ยอดเงิน)
        this.auth.me$().subscribe();
        const r = this.auth.role();
        this.router.navigate([r === 'ADMIN' ? '/admin' : '/user']);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      },
      complete: () => this.loading.set(false),
    });
  }
}
