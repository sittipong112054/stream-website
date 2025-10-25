import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { GameDto, GameService } from '../../../../core/services/game';
import { CategoryService, Category } from '../../../../core/services/category';
import id from '@angular/common/locales/id';

interface Game {
  id: number;
  title: string;
  price: number;
  categoryId: number;
  categoryName?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  releasedAt?: string | null;
  releaseDate?: string | null;
  status?: string;
}

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './games.html',
  styleUrls: ['./games.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGamesPage {
  constructor(private api: GameService, private cats: CategoryService) {
    this.load();
    this.loadCategories();
  }

  loading = signal(false);
  games = signal<Game[]>([]);
  categories = signal<Category[]>([]);
  q = signal('');

  showModal = signal(false);
  editingId = signal<number | null>(null);
  form = {
    title: signal(''),
    categoryId: signal<number>(1),
    price: signal<number>(0),
    description: signal(''),
    releasedAt: signal<string>(''),
    image: signal<File | null>(null),
  };

  detailsOpen = signal(false);
  detailsLoading = signal(false);
  selected = signal<Game | null>(null);

filtered = computed(() => {
  const term = this.q().toLowerCase().trim();
  if (!term) return this.games();
  return this.games().filter((g) =>
    g.title.toLowerCase().includes(term) ||
    (g.categoryName?.toLowerCase().includes(term) ?? false)
  );
});


  openDetails(id: number) {
    this.detailsOpen.set(true);
    this.detailsLoading.set(true);
    this.selected.set(null);

    this.api.getOneAdmin(id).subscribe({
      next: (res: { data: any; }) => {
        const r = res.data;
        this.selected.set({
          id: r.id,
          title: r.title,
          price: Number(r.price),
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          imageUrl: r.imageUrl,
          description: r.description,
          releasedAt: r.releasedAt,
          releaseDate: r.releaseDate,
          status: r.status,
        });
        this.detailsLoading.set(false);
      },
      error: (e: any) => {
        console.error(e);
        this.detailsLoading.set(false);
      },
    });
  }

  closeDetails() {
    this.detailsOpen.set(false);
    this.selected.set(null);
  }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (res: { ok: boolean; data: GameDto[] }) => {
        const data = (res.data || []).map((r) => ({
          id: r.id,
          title: r.title,
          price: r.price,
          categoryId: r.categoryId,
          categoryName: r.categoryName,
          imageUrl: r.imageUrl,
          description: r.description ?? null,
          releasedAt: r.releasedAt ?? null,
          releaseDate: r.releaseDate ?? null,
          status: r.status ?? 'ACTIVE',
        }));
        this.games.set(data as any);
        this.loading.set(false);
      },
      error: (_err: any) => {
        this.loading.set(false);
      },
    });
  }

  loadCategories() {
    this.cats.list().subscribe({
      next: (res) => this.categories.set(res.data),
      error: (e) => console.error('loadCategories error', e),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.title.set('');
    this.form.categoryId.set(this.categories()[0]?.id ?? 1);
    this.form.price.set(0);
    this.form.description.set('');
    this.form.releasedAt.set('');
    this.form.image.set(null);
    this.showModal.set(true);
  }

  openEdit(g: any) {
    this.editingId.set(g.id);
    this.api.getOneAdmin(g.id).subscribe({
      next: (res: { ok: boolean; data: GameDto }) => {
        const r = res.data;
        this.form.title.set(r.title);
        this.form.categoryId.set(r.categoryId);
        this.form.price.set(Number(r.price));
        this.form.description.set(r.description || '');
        this.form.releasedAt.set(
          r.releaseDate || (r.releasedAt ? r.releasedAt.substring(0, 10) : '')
        );
        this.form.image.set(null);
        this.showModal.set(true);
      },
      error: (e: any) => {
        console.error(e);
        alert('Load game failed');
      },
    });
  }

  onPickFile(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0] || null;
    this.form.image.set(f);
  }

  save() {
    const id = this.editingId();
    const payload = {
      title: this.form.title(),
      categoryId: this.form.categoryId(),
      price: this.form.price(),
      description: this.form.description(),
      releasedAt: this.form.releasedAt(),
      image: this.form.image(),
    };

    (id == null
      ? this.api.create(payload)
      : this.api.update(id, payload)
    ).subscribe({
      next: () => {
        this.showModal.set(false);
        this.load();
      },
      error: (e: any) => {
        console.error(e);
        alert('Save failed');
      },
    });
  }

  delete(id: number) {
    if (!confirm('Delete this game?')) return;
    this.api.delete(id).subscribe({
      next: () => this.load(),
      error: (e) => {
        console.error(e);
        alert('Delete failed');
      },
    });
  }
  onInputString(setter: (v: string) => void, ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    setter(value);
  }

  onInputNumber(setter: (v: number) => void, ev: Event) {
    const value = +(ev.target as HTMLInputElement).value;
    setter(value);
  }
}
