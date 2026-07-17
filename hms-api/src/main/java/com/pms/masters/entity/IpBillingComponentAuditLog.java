package com.pms.masters.entity;

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
 * Append-only audit trail for IP Billing Component create/update/deactivate/
 * restore operations, mirroring ConsultantAuditLog's shape but extended with
 * content/previousContent - human-readable state snapshots that drive the
 * Billing Activity Log screen's Content/Previous Content columns directly,
 * with no frontend diffing needed.
 */
@Entity
@Table(name = "ip_billing_component_audit_log")
@Getter
@Setter
@NoArgsConstructor
public class IpBillingComponentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "component_id", nullable = false)
    private Long componentId;

    @Column(name = "component_name", nullable = false)
    private String componentName;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(length = 1000)
    private String content;

    @Column(name = "previous_content", length = 1000)
    private String previousContent;

    @Column(name = "performed_by", nullable = false, length = 100)
    private String performedBy;

    @Column(name = "performed_at", nullable = false)
    private Instant performedAt;

    public IpBillingComponentAuditLog(
            Long componentId, String componentName, String operation, String content, String previousContent, String performedBy) {
        this.componentId = componentId;
        this.componentName = componentName;
        this.operation = operation;
        this.content = content;
        this.previousContent = previousContent;
        this.performedBy = performedBy;
        this.performedAt = Instant.now();
    }
}
