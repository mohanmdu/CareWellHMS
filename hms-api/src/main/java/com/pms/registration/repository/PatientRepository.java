package com.pms.registration.repository;

import com.pms.registration.entity.Patient;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    boolean existsByRegistrationNumber(String registrationNumber);

    List<Patient> findByMobileNumber(String mobileNumber);

    List<Patient> findByActiveTrueOrderByIdDesc();

    List<Patient> findByActiveFalseOrderByUpdatedAtDesc();

    List<Patient> findByActiveTrueAndFirstNameContainingIgnoreCaseOrActiveTrueAndLastNameContainingIgnoreCase(
            String firstName, String lastName);
}
