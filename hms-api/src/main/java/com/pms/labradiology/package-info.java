/**
 * Lab & Radiology module (Migration Plan Phase 2, order 4). Replaces LabAction
 * traced in migration doc §4.4. CT-Scan/Xray are NOT separate features - they are
 * a LabCategory master-data variant of this same requisition/result/billing flow;
 * do not create separate ctscan/xray packages (see doc §4, dead-code findings).
 * Replace the legacy raw int "byPass" approval flag with a named enum
 * (e.g. DRAFT, PENDING_APPROVAL, APPROVED).
 */
package com.pms.labradiology;
