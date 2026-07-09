/**
 * OP Billing, Receipts & Insurance module (Migration Plan Phase 2, order 3 -
 * financial-correctness critical, needs Phase 0 characterization tests first).
 * Replaces billing logic scattered across AdminAction, LabAction and IPAction
 * (Insurance is owned by IPAction in the legacy app, not a standalone module -
 * see migration doc §4.5) plus BillingDao/BillingDaoImpl.
 * Priority fix while porting: parameterize the string-concatenated HQL in
 * IPDaoImpl.updateApprovalDetails / getInsuranceDetailsByDate (doc risk R9),
 * and replace Java-loop claim total aggregation with SQL SUM() (doc risk R12).
 */
package com.pms.billing;
