package com.pms.lab.repository;

import com.pms.lab.entity.LabRequisitionItem;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LabRequisitionItemRepository extends JpaRepository<LabRequisitionItem, Long> {
    List<LabRequisitionItem> findByRequisitionId(Long requisitionId);

    /**
     * CEO/MD Dashboard OP Revenue's Lab vs Radiology split - the trickiest
     * revenue query in the feature. LabRequisitionItem.subCategory is
     * nullable: a real Lab test has it (join through lab_sub_category ->
     * lab_category for its tag), an ad-hoc "Investigations" item only has a
     * snapshotted category_name string sourced from the OP Billing Catalog
     * (join op_billing_category by name instead). Falls back to 'LAB' if
     * neither side tags it (e.g. an ad-hoc category with no matching master
     * row anymore).
     */
    @Query(
            value = """
                    SELECT COALESCE(labCat.revenue_bucket, opCat.revenue_bucket, 'LAB') AS bucket, SUM(i.amount) AS amount
                    FROM lab_requisition_item i
                    JOIN lab_requisition r ON r.id = i.requisition_id
                    LEFT JOIN lab_sub_category lsc ON lsc.id = i.sub_category_id
                    LEFT JOIN lab_category labCat ON labCat.id = lsc.category_id
                    LEFT JOIN op_billing_category opCat ON opCat.name = i.category_name AND i.sub_category_id IS NULL
                    WHERE r.status = 'APPROVED' AND r.patient_type = 'OP'
                      AND (:from IS NULL OR r.approved_at >= :from) AND (:to IS NULL OR r.approved_at < :to)
                    GROUP BY COALESCE(labCat.revenue_bucket, opCat.revenue_bucket, 'LAB')
                    """,
            nativeQuery = true)
    List<RevenueBucketAmount> sumOpAmountByRevenueBucket(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** Projection for sumOpAmountByRevenueBucket() - bucket is the RevenueBucket enum name as a string. */
    interface RevenueBucketAmount {
        String getBucket();

        double getAmount();
    }
}
