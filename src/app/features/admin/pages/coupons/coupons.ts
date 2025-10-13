import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  DiscountCodeDto,
  DiscountCodesService,
} from '../../../../core/services/copons';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [CommonModule, DatePipe, ReactiveFormsModule],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Coupons {
  private api = inject(DiscountCodesService);
  private fb = inject(FormBuilder);
  private fbn = this.fb.nonNullable;

  showCreate = signal(false);
  saving = signal(false);

  loading = signal(true);
  error = signal<string | null>(null);
  query = signal('');
  codes = signal<DiscountCodeDto[]>([]);
  editingId = signal<number | null>(null);

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.codes();
    return this.codes().filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        String(c.discount_value).includes(q) ||
        (c.discount_type === 'PERCENT'
          ? 'percentage'
          : 'fixed amount'
        ).includes(q)
    );
  });

  form = this.fb.group({
    code: this.fbn.control('', {
      validators: [Validators.required, Validators.maxLength(64)],
    }),
    description: this.fbn.control(''),
    discount_type: this.fbn.control<'PERCENT' | 'AMOUNT'>('PERCENT', {
      validators: [Validators.required],
    }),
    discount_value: this.fbn.control(20, {
      validators: [Validators.required, Validators.min(1)],
    }),

    max_uses: this.fb.control<number | null>(null, {
      validators: [Validators.min(0)],
    }),

    per_user_limit: this.fbn.control(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    active: this.fbn.control(true),

    start_at: this.fb.control<string | null>(null),
    end_at: this.fb.control<string | null>(null),
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.api.list().subscribe({
      next: ({ data }) => this.codes.set(data || []),
      error: () => this.error.set('โหลดรายการโค้ดไม่สำเร็จ'),
      complete: () => this.loading.set(false),
    });
  }

  usageText(c: DiscountCodeDto) {
    const used = c.used_count ?? 0;
    const max = c.max_uses ?? 0;
    return c.max_uses ? `${used}/${max}` : `${used}`;
  }
  usagePct(c: DiscountCodeDto) {
    const used = c.used_count ?? 0;
    const max = c.max_uses ?? 0;
    if (!max) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  }
  typeLabel(c: DiscountCodeDto) {
    return c.discount_type === 'PERCENT' ? 'Percentage' : 'Fixed Amount';
  }
  valueLabel(c: DiscountCodeDto) {
    return c.discount_type === 'PERCENT'
      ? `${c.discount_value}%`
      : `฿${c.discount_value}`;
  }

  closeCreate() {
    this.showCreate.set(false);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({
      code: '',
      description: '',
      discount_type: 'PERCENT',
      discount_value: 20,
      max_uses: 100,
      per_user_limit: 1,
      active: true,
      start_at: null,
      end_at: null,
    });
    this.showCreate.set(true);
  }

  openEdit(c: DiscountCodeDto) {
    this.editingId.set(c.id);
    this.form.reset({
      code: c.code,
      description: c.description ?? '',
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      max_uses: c.max_uses,
      per_user_limit: c.per_user_limit ?? 1,
      active: !!c.active,
      start_at: c.start_at ? c.start_at.slice(0, 16) : null,
      end_at: c.end_at ? c.end_at.slice(0, 16) : null,
    });
    this.showCreate.set(true);
  }

  submitCreate() {
    if (this.form.invalid || this.saving()) return;


    // กันเปอร์เซ็นต์ 1–100
    if (this.form.value.discount_type === 'PERCENT') {
      const v = Number(this.form.value.discount_value ?? 0);
      if (v < 1 || v > 100) {
        alert('Percent ต้องอยู่ระหว่าง 1–100');
        return;
      }
    }

    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload = {
    code: (v.code ?? '').trim(),
    description: v.description ?? null,
    discount_type: v.discount_type!,
    discount_value: Number(v.discount_value),
    max_uses: v.max_uses == null ? null : Math.floor(Number(v.max_uses)),
    per_user_limit: Math.max(1, Math.floor(Number(v.per_user_limit ?? 1))),
    active: !!v.active,
    start_at: v.start_at ?? null,
    end_at: v.end_at ?? null,
    };

    const id = this.editingId();

    const req$ = id ? this.api.update(id, payload) : this.api.create(payload);

    req$.subscribe({
      next: () => {
        this.closeCreate();
        this.load();
      },
      error: (e) => {
        alert(e?.error?.error || 'Save failed');
        this.saving.set(false);
      },
    });

    this.saving.set(true);
    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreate();
        this.load();
      },
      error: (e) => {
        this.saving.set(false);
        alert(e?.error?.error || 'Create failed');
      },
    });
  }

  remove(c: DiscountCodeDto) {
    if (!confirm(`ลบโค้ด ${c.code}?`)) return;
    this.api.remove(c.id).subscribe({
      next: () => this.codes.set(this.codes().filter((x) => x.id !== c.id)),
      error: () => alert('ลบไม่สำเร็จ'),
    });
  }

  showType(t: string) {
    return t === 'PERCENT' ? 'Percentage' : 'Fixed Amount';
  }

  today = new Date();

toDate(s: string | null | undefined): Date {
  return s ? new Date(s) : new Date(0);
}

}
