import { computed, Signal, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

/**
 * Client-side paging over an already-fetched array. Every list endpoint in
 * this app returns its full dataset in one call (no server-side Pageable
 * anywhere yet) - datasets are small master/reference data, so paging what's
 * already in memory is enough rather than reworking every endpoint to accept
 * page/size params. Instantiate one per table, bind <mat-paginator> to it,
 * and feed `page()` as the table's dataSource.
 */
export class TablePagination<T> {
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  constructor(private readonly source: Signal<T[]>) {}

  readonly length = computed(() => this.source().length);

  readonly page = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.source().slice(start, start + this.pageSize());
  });

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /** Call after the search term or underlying data changes, so a stale pageIndex doesn't land on an empty page. */
  reset(): void {
    this.pageIndex.set(0);
  }
}
