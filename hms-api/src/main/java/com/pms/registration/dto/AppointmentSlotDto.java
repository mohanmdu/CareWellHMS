package com.pms.registration.dto;

import com.pms.masters.entity.Session;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * `date` is the slot's true calendar date - for a wrapping NIGHT session
 * queried against day D, the portion after midnight carries date D+1, not D.
 * Callers must book using this date, not the date they queried slots for.
 */
public record AppointmentSlotDto(
        LocalDate date,
        LocalTime time,
        Session session,
        SlotStatus status,
        Long appointmentId,
        Long patientId,
        String patientName) {
}
