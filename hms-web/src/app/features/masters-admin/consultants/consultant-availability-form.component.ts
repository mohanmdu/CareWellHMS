import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {
  ConsultantAvailability,
  ConsultantTiming,
  DayOfWeek,
  DAYS_OF_WEEK,
  isValidSessionRange,
  Session,
  SESSION_LABELS,
  SESSION_RANGES,
  SESSIONS
} from './consultant-timing.model';

type TimeField = { startTime: string; endTime: string };
type Rows = Record<DayOfWeek, Record<Session, TimeField>>;

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday'
};

/**
 * Doctor Availability grid - 7 days x 4 sessions (morning/afternoon/evening/night),
 * each session's from/to left blank meaning "not available that session" -
 * plus a slots-per-hour setting. Embedded both in the standalone "Update
 * Timings" dialog and inline on the Add/Edit Consultant form (shown when
 * Appointment Status is Yes) so the grid markup isn't duplicated.
 *
 * Each session is restricted to a fixed time-of-day window (SESSION_RANGES) -
 * the native <input type="time"> min/max enforces this per HTML5's
 * wrap-aware range semantics (min > max means "outside [max, min]"), which
 * happens to be exactly right for NIGHT's 22:00-05:59 wrap; isValidSessionRange
 * double-checks on submit since browsers vary in how strictly they enforce it.
 */
@Component({
  selector: 'app-consultant-availability-form',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './consultant-availability-form.component.html',
  styleUrl: './consultant-availability-form.component.scss'
})
export class ConsultantAvailabilityFormComponent implements OnInit {
  initialAvailability = input<ConsultantAvailability | null>(null);

  readonly days = DAYS_OF_WEEK;
  readonly sessions = SESSIONS;
  readonly sessionLabels = SESSION_LABELS;
  readonly sessionRanges = SESSION_RANGES;
  readonly dayLabels = DAY_LABELS;
  readonly slotsPerHourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  slotsPerHour = 1;
  rows: Rows = this.buildEmptyRows();

  ngOnInit(): void {
    const initial = this.initialAvailability();
    if (!initial) {
      return;
    }
    this.slotsPerHour = initial.slotsPerHour;
    for (const timing of initial.timings) {
      this.rows[timing.dayOfWeek][timing.session] = {
        startTime: timing.startTime.slice(0, 5),
        endTime: timing.endTime.slice(0, 5)
      };
    }
  }

  /** Drives the red highlight on the specific From/To cell that's wrong, rather than just a page-level warning. */
  cellInvalid(day: DayOfWeek, session: Session): boolean {
    const field = this.rows[day][session];
    if (Boolean(field.startTime) !== Boolean(field.endTime)) {
      return true;
    }
    return Boolean(field.startTime) && Boolean(field.endTime) && !isValidSessionRange(session, field.startTime, field.endTime);
  }

  get isValid(): boolean {
    for (const day of this.days) {
      for (const session of this.sessions) {
        if (this.cellInvalid(day, session)) {
          return false;
        }
      }
    }
    return true;
  }

  getValue(): ConsultantAvailability {
    const timings: ConsultantTiming[] = [];
    for (const day of this.days) {
      for (const session of this.sessions) {
        const field = this.rows[day][session];
        if (field.startTime && field.endTime) {
          timings.push({ dayOfWeek: day, session, startTime: field.startTime, endTime: field.endTime });
        }
      }
    }
    return { slotsPerHour: this.slotsPerHour, timings };
  }

  private buildEmptyRows(): Rows {
    const rows = {} as Rows;
    for (const day of DAYS_OF_WEEK) {
      rows[day] = {} as Record<Session, TimeField>;
      for (const session of SESSIONS) {
        rows[day][session] = { startTime: '', endTime: '' };
      }
    }
    return rows;
  }
}
