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
 * Append-only audit trail for Room Type create/update/deactivate/restore
 * operations, mirroring ConsultantAuditLog - drives the "Created by & Date" /
 * "Deactivated by & Date" columns on the Room Types screen.
 */
@Entity
@Table(name = "room_type_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class RoomTypeAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_type_id", nullable = false)
    private Long roomTypeId;

    @Column(name = "room_type_name", nullable = false)
    private String roomTypeName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public RoomTypeAuditLog(Long roomTypeId, String roomTypeName, String operation, String performedBy) {
        this.roomTypeId = roomTypeId;
        this.roomTypeName = roomTypeName;
        this.operation = operation;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
