package com.pms.masters.entity;

import java.time.LocalTime;

/**
 * One of a consultant's four working sessions in a day (see ConsultantTiming),
 * each with a fixed allowed time-of-day window. NIGHT wraps past midnight
 * (22:00-05:59 the next day) - callers must use {@link #isValidRange} rather
 * than a plain start-before-end check, since a wrapping session's end time is
 * numerically earlier than its start time.
 */
public enum Session {
    MORNING(LocalTime.of(6, 0), LocalTime.of(11, 59, 59)),
    AFTERNOON(LocalTime.of(12, 0), LocalTime.of(16, 59, 59)),
    EVENING(LocalTime.of(17, 0), LocalTime.of(21, 59, 59)),
    NIGHT(LocalTime.of(22, 0), LocalTime.of(5, 59, 59));

    private final LocalTime rangeStart;
    private final LocalTime rangeEnd;

    Session(LocalTime rangeStart, LocalTime rangeEnd) {
        this.rangeStart = rangeStart;
        this.rangeEnd = rangeEnd;
    }

    public LocalTime rangeStart() {
        return rangeStart;
    }

    public LocalTime rangeEnd() {
        return rangeEnd;
    }

    public boolean wrapsMidnight() {
        return this == NIGHT;
    }

    public boolean contains(LocalTime time) {
        if (wrapsMidnight()) {
            return !time.isBefore(rangeStart) || !time.isAfter(rangeEnd);
        }
        return !time.isBefore(rangeStart) && !time.isAfter(rangeEnd);
    }

    /** True if both times fall in this session's window and start comes before end (wrap-aware for NIGHT). */
    public boolean isValidRange(LocalTime start, LocalTime end) {
        if (!contains(start) || !contains(end)) {
            return false;
        }
        return normalizedMinutes(start) < normalizedMinutes(end);
    }

    /** Minutes elapsed since this session's rangeStart, wrapping past midnight - makes ordering comparisons monotonic. */
    private long normalizedMinutes(LocalTime time) {
        long minutesSinceMidnight = time.getHour() * 60L + time.getMinute();
        long rangeStartMinutes = rangeStart.getHour() * 60L + rangeStart.getMinute();
        return Math.floorMod(minutesSinceMidnight - rangeStartMinutes, 24 * 60L);
    }
}
