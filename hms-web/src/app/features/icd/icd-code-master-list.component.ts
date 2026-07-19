import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TablePagination } from '../../shared/table/table-pagination';
import { TableSearchComponent } from '../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { IcdCodeFormDialogComponent } from './icd-code-form-dialog.component';
import { IcdCodeService } from './icd-code.service';
import { IcdCode } from './icd.model';

/**
 * ICD Code Master (screen 3 of 3): admin CRUD over the reference code table,
 * mirroring ConsultantListComponent's Active/De-Activated tab shape. Import
 * is a real CSV upload (see IcdCodeService.importCsv - no XLSX-parsing
 * library exists anywhere in this codebase, so CSV, which Excel opens/saves
 * natively, is the bulk-load format rather than the literal "Excel" binary);
 * Export/Print mirror the same CSV+Print-popup pattern already used by the
 * IP/OP Billing Activity Log, for the same reason (no PDF-generation library
 * exists either).
 */
@Component({
  selector: 'app-icd-code-master-list',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatTabsModule,
    TableSearchComponent,
    EmptyStateComponent
  ],
  templateUrl: './icd-code-master-list.component.html',
  styleUrl: './icd-code-master-list.component.scss'
})
export class IcdCodeMasterListComponent {
  private readonly service = inject(IcdCodeService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;
  @ViewChild('importInput') importInput?: ElementRef<HTMLInputElement>;

  activeCodes = signal<IcdCode[]>([]);
  inactiveCodes = signal<IcdCode[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  searchTerm = signal('');

  filteredActiveCodes = computed(() => this.filterBySearch(this.activeCodes()));
  filteredInactiveCodes = computed(() => this.filterBySearch(this.inactiveCodes()));
  activePagination = new TablePagination(this.filteredActiveCodes);
  inactivePagination = new TablePagination(this.filteredInactiveCodes);

  constructor() {
    this.refreshActive();
  }

  private filterBySearch(codes: IcdCode[]): IcdCode[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return codes;
    }
    return codes.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.diseaseName.toLowerCase().includes(term) ||
        (c.category ?? '').toLowerCase().includes(term) ||
        (c.chapter ?? '').toLowerCase().includes(term) ||
        (c.whoVersion ?? '').toLowerCase().includes(term)
    );
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.activePagination.reset();
    this.inactivePagination.reset();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (codes) => {
        this.activeCodes.set(codes);
        this.activePagination.reset();
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load ICD codes.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (codes) => {
        this.inactiveCodes.set(codes);
        this.inactivePagination.reset();
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load de-activated ICD codes.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  openAddDialog(): void {
    this.openFormDialog();
  }

  openEditDialog(icdCode: IcdCode): void {
    this.openFormDialog(icdCode);
  }

  private openFormDialog(icdCode?: IcdCode): void {
    this.dialog
      .open(IcdCodeFormDialogComponent, { width: '640px', maxWidth: '95vw', data: { icdCode } })
      .afterClosed()
      .subscribe((input) => {
        if (!input) {
          return;
        }
        const save$ = icdCode ? this.service.update(icdCode.id, input) : this.service.create(input);
        save$.subscribe({
          next: () => {
            this.notification.success(icdCode ? 'ICD code updated.' : 'ICD code added.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to save the ICD code.')
        });
      });
  }

  deactivate(icdCode: IcdCode): void {
    this.confirmDialog
      .confirm({
        title: `Deactivate ${icdCode.code}?`,
        message: 'This ICD code will be moved to De-Activated Codes and can be restored later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.deactivate(icdCode.id).subscribe({
          next: () => {
            this.notification.success('ICD code deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: () => this.notification.error('Failed to deactivate the ICD code.')
        });
      });
  }

  restore(icdCode: IcdCode): void {
    this.service.restore(icdCode.id).subscribe({
      next: () => {
        this.notification.success('ICD code restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore the ICD code.')
    });
  }

  triggerImport(): void {
    this.importInput?.nativeElement.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.service.importCsv(file).subscribe({
      next: (result) => {
        this.notification.success(`Imported ${result.imported} code(s), skipped ${result.skipped}.`);
        this.refreshActive();
      },
      error: () => this.notification.error('Failed to import the CSV file.')
    });
  }

  print(): void {
    const content = this.reportContent?.nativeElement.innerHTML;
    if (!content) {
      return;
    }
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      this.notification.error('Please allow pop-ups to print the report.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>ICD Code Master</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; margin: 24px; }
            h1 { font-size: 1.25rem; margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #1565c0; color: #fff; }
          </style>
        </head>
        <body>
          <h1>ICD Code Master</h1>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => printWindow.print();
  }

  exportCsv(): void {
    const codes = this.filteredActiveCodes();
    if (codes.length === 0) {
      return;
    }
    const header = ['ICD Code', 'Disease Name', 'Chapter', 'Category', 'WHO Version', 'Short Description', 'Status', 'Created By', 'Last Updated'];
    const csvCell = (value: string | number | null | undefined): string => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };
    const lines = [header.map(csvCell).join(',')];
    codes.forEach((c) => {
      lines.push(
        [
          csvCell(c.code),
          csvCell(c.diseaseName),
          csvCell(c.chapter),
          csvCell(c.category),
          csvCell(c.whoVersion),
          csvCell(c.shortDescription),
          csvCell(c.active ? 'Active' : 'Inactive'),
          csvCell(c.createdBy),
          csvCell(c.updatedAt)
        ].join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'icd-code-master.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}
