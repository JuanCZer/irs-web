import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  numberAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface PaginationItem {
  page: number | null;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input({ transform: numberAttribute }) currentPage = 1;
  @Input({ transform: numberAttribute }) pageSize = 10;
  @Input({ transform: numberAttribute }) totalItems = 0;
  @Input({ transform: numberAttribute }) maxVisiblePages = 5;
  @Input() itemLabel = 'registros';
  @Input() singularItemLabel = 'registro';

  @Output() readonly pageChange = new EventEmitter<number>();

  get safePageSize(): number {
    return Math.max(1, Math.floor(this.pageSize || 1));
  }

  get safeTotalItems(): number {
    return Math.max(0, Math.floor(this.totalItems || 0));
  }

  get totalPages(): number {
    return Math.ceil(this.safeTotalItems / this.safePageSize);
  }

  get activePage(): number {
    if (this.totalPages === 0) {
      return 1;
    }

    return Math.min(
      this.totalPages,
      Math.max(1, Math.floor(this.currentPage || 1)),
    );
  }

  get firstVisibleItem(): number {
    return this.safeTotalItems === 0
      ? 0
      : (this.activePage - 1) * this.safePageSize + 1;
  }

  get lastVisibleItem(): number {
    return Math.min(this.activePage * this.safePageSize, this.safeTotalItems);
  }

  get resolvedItemLabel(): string {
    return this.safeTotalItems === 1 ? this.singularItemLabel : this.itemLabel;
  }

  get paginationItems(): PaginationItem[] {
    if (this.totalPages === 0) {
      return [];
    }

    const visiblePageCount = Math.max(
      3,
      Math.floor(this.maxVisiblePages || 5),
    );

    if (this.totalPages <= visiblePageCount) {
      return Array.from({ length: this.totalPages }, (_, index) => ({
        page: index + 1,
      }));
    }

    const pages = new Set<number>([1, this.activePage, this.totalPages]);
    let distance = 1;

    while (pages.size < visiblePageCount && distance < this.totalPages) {
      const previousPage = this.activePage - distance;
      const nextPage = this.activePage + distance;

      if (previousPage > 1) {
        pages.add(previousPage);
      }

      if (pages.size < visiblePageCount && nextPage < this.totalPages) {
        pages.add(nextPage);
      }

      distance++;
    }

    const sortedPages = [...pages].sort((a, b) => a - b);
    const items: PaginationItem[] = [];

    sortedPages.forEach((page, index) => {
      const previousPage = sortedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        items.push({ page: null });
      }

      items.push({ page });
    });

    return items;
  }

  selectPage(page: number | null): void {
    if (page === null || page === this.activePage) {
      return;
    }

    const targetPage = Math.min(this.totalPages, Math.max(1, page));

    if (targetPage !== this.activePage) {
      this.pageChange.emit(targetPage);
    }
  }

  previousPage(): void {
    this.selectPage(this.activePage - 1);
  }

  nextPage(): void {
    this.selectPage(this.activePage + 1);
  }

  trackPaginationItem(index: number, item: PaginationItem): string | number {
    return item.page ?? `ellipsis-${index}`;
  }
}
