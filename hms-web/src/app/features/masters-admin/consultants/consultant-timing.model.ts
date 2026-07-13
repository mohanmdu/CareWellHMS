export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

export type Session = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export const SESSIONS: Session[] = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

export const SESSION_LABELS: Record<Session, string> = {
  MORNING: 'Morning Session',
  AFTERNOON: 'Afternoon Session',
  EVENING: 'Evening Session',
  NIGHT: 'Night Session'
};

/** Fixed time-of-day window each session is restricted to (mirrors the backend Session enum). NIGHT wraps past midnight. */
export const SESSION_RANGES: Record<Session, { start: string; end: string; wraps: boolean }> = {
  MORNING: { start: '06:00', end: '11:59', wraps: false },
  AFTERNOON: { start: '12:00', end: '16:59', wraps: false },
  EVENING: { start: '17:00', end: '21:59', wraps: false },
  NIGHT: { start: '22:00', end: '05:59', wraps: true }
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function normalizedMinutes(session: Session, time: string): number {
  const range = SESSION_RANGES[session];
  const minutes = toMinutes(time);
  const rangeStartMinutes = toMinutes(range.start);
  return (((minutes - rangeStartMinutes) % 1440) + 1440) % 1440;
}

export function isTimeWithinSession(session: Session, time: string): boolean {
  const range = SESSION_RANGES[session];
  const minutes = toMinutes(time);
  const start = toMinutes(range.start);
  const end = toMinutes(range.end);
  return range.wraps ? minutes >= start || minutes <= end : minutes >= start && minutes <= end;
}

/** True if both times fall inside the session's allowed window and start comes before end (wrap-aware for NIGHT). */
export function isValidSessionRange(session: Session, startTime: string, endTime: string): boolean {
  if (!isTimeWithinSession(session, startTime) || !isTimeWithinSession(session, endTime)) {
    return false;
  }
  return normalizedMinutes(session, startTime) < normalizedMinutes(session, endTime);
}

export interface ConsultantTiming {
  dayOfWeek: DayOfWeek;
  session: Session;
  startTime: string;
  endTime: string;
}

export interface ConsultantAvailability {
  slotsPerHour: number;
  timings: ConsultantTiming[];
}
