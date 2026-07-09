import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { LabRequisition, LabRequisitionItem } from './lab-requisition.model';
import { LabRequisitionService } from './lab-requisition.service';

const REQUISITION_STATUS_TONE: Record<string, StatusBadgeTone> = {
  ORDERED: 'info',
  CANCELLED: 'danger'
};

const ITEM_STATUS_TONE: Record<string, StatusBadgeTone> = {
  PENDING: 'warning',
  SPECIMEN_COLLECTED: 'info',
  RESULT_ENTERED: 'neutral',
  APPROVED: 'success'
};

/**
 * Replaces the legacy labEntrySaveAction (byPass=1 draft save, byPass=2
 * approve) with explicit per-item actions (migration doc §4.4).
 */
@Component({
  selector: 'app-requisition-worklist',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './requisition-worklist.component.html',
  styleUrl: './requisition-worklist.component.scss'
})
export class RequisitionWorklistComponent {
  private readonly service = inject(LabRequisitionService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly itemColumns = ['test', 'specimen', 'status', 'result', 'actions'];
  readonly requisitionStatusTone = REQUISITION_STATUS_TONE;
  readonly itemStatusTone = ITEM_STATUS_TONE;

  requisitions = signal<LabRequisition[]>([]);
  loading = signal(false);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (requisitions) => {
        this.requisitions.set(requisitions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load requisitions.');
      }
    });
  }

  collectSpecimen(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) {
      return;
    }
    this.service.collectSpecimen(requisition.id, item.id).subscribe({
      next: () => {
        this.notification.success('Specimen collected.');
        this.refresh();
      },
      error: () => this.notification.error('Failed to collect specimen.')
    });
  }

  enterResult(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Enter result - ${item.testName}`,
        fields: [
          { key: 'resultValue', label: 'Result value', type: 'text', required: true },
          { key: 'normalRange', label: 'Normal range', type: 'text' }
        ],
        confirmLabel: 'Save result'
      })
      .subscribe((values) => {
        if (!values || requisition.id === null || item.id === null) {
          return;
        }
        this.service
          .enterResult(requisition.id, item.id, values['resultValue'] as string, values['normalRange'] as string)
          .subscribe({
            next: () => {
              this.notification.success('Result saved.');
              this.refresh();
            },
            error: () => this.notification.error('Failed to enter result.')
          });
      });
  }

  approve(requisition: LabRequisition, item: LabRequisitionItem): void {
    if (requisition.id === null || item.id === null) {
      return;
    }
    this.service.approve(requisition.id, item.id).subscribe({
      next: () => {
        this.notification.success('Result approved.');
        this.refresh();
      },
      error: () => this.notification.error('Failed to approve result.')
    });
  }
}
