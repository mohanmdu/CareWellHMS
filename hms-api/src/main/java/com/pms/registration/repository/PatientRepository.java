package com.pms.registration.repository;

import com.pms.registration.entity.Patient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    boolean existsByRegistrationNumber(String registrationNumber);

    // Registration numbers are fixed-width (NF-<year>-00001), so lexicographic
    // and numeric ordering agree - used to derive the next number from what's
    // actually in the table instead of a row count that drifts after a
    // permanent delete (see PatientService.nextRegistrationNumber).
    Optional<Patient> findTopByRegistrationNumberStartingWithOrderByRegistrationNumberDesc(String prefix);

    List<Patient> findByMobileNumber(String mobileNumber);

    List<Patient> findByActiveTrueOrderByIdDesc();

    List<Patient> findByActiveFalseOrderByUpdatedAtDesc();

    // Matches by first/last name, registration number (PID), or mobile number,
    // so the same search box - as the booking wizard's patient search allows -
    // finds a patient regardless of which of the three the staff has on hand.
    @Query("""
            SELECT p FROM Patient p
            WHERE p.active = true AND (
                LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(p.registrationNumber) LIKE LOWER(CONCAT('%', :query, '%'))
                OR p.mobileNumber LIKE CONCAT('%', :query, '%')
            )
            """)
    List<Patient> searchActive(@Param("query") String query);
}
