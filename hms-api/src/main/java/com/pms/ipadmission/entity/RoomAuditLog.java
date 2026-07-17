package com.pms.ipadmission.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Append-only audit trail for Room create/update/deactivate/restore/status-change
 * operations, mirroring ConsultantAuditLog - drives the "Created by & Date" /
 * "Deactivated by & Date" columns on the Room Numbers screen.
 */
@Entity
@Table(name = "room_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class RoomAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public RoomAuditLog(Long roomId, String roomNumber, String operation, String performedBy) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
