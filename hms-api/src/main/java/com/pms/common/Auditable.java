package com.pms.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import java.time.Instant;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Standardizes the created_by/created_date/updated_by/updated_date columns
 * that the legacy app hand-rolled separately on every master entity
 * (Department, Consultant, RoleMaster, ...) - see migration doc §4.6.
 * created_by/updated_by are deferred until real authentication carries a
 * user identity (see SecurityConfig) rather than left half-wired.
 */
@MappedSuperclass
@Getter
public abstract class Auditable {

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
