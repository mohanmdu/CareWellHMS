import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { AppointmentAuditLogEntry } from '../booking/appointment.model';

export interface AppointmentAuditChangesDialogData {
  log: AppointmentAuditLogEntry;
}

interface ChangeRow {
  field: string;
  before: string;
  after: string;
}

function parseSnapshot(json: string | null): Record<string, unknown> {
  if (!json) {
    return {};
  }
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

/**
 * Field-by-field before/after diff for one AppointmentAuditLog row - parses
 * the JSON snapshots generically (Object.keys()) rather than coupling to
 * the backend's AppointmentAuditSnapshot shape, so this doesn't need to
 * change if that record's fields do.
 */
@Component({
  selector: 'app-appointment-audit-changes-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatTableModule],
  templateUrl: './appointment-audit-changes-dialog.component.html',
  styleUrl: './appointment-audit-changes-dialog.component.scss'
})
export class AppointmentAuditChangesDialogComponent {
  private readonly data = inject<AppointmentAuditChangesDialogData>(MAT_DIALOG_DATA);

  readonly log = this.data.log;
  readonly displayedColumns = ['field', 'before', 'after'];
  readonly rows: ChangeRow[] = this.buildRows();

  private buildRows(): ChangeRow[] {
    const before = parseSnapshot(this.log.previousValue);
    const after = parseSnapshot(this.log.newValue);
    const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
    return Array.from(fields).map((field) => ({
      field,
      before: formatValue(before[field]),
      after: formatValue(after[field])
    }));
  }
}
