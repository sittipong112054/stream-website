import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subheader',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './subheader.html',
  styleUrl: './subheader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreSubheader {
  @Input() cartCount = 0;
  @Input() categories: string[] = ['ทั้งหมด', 'Action', 'RPG', 'Strategy', 'Sports', 'Indie'];
  @Input() selectedCategory = 'ทั้งหมด';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() cartClick = new EventEmitter<void>();

  q = '';

  onPick(cat: string) {
    this.selectedCategory = cat;
    this.categoryChange.emit(cat);
  }
}