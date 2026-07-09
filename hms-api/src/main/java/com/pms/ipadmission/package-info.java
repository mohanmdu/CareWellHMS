/**
 * In-Patient admission, ward billing, discharge & refund module
 * (Migration Plan Phase 2, order 6 - migrate last, most cross-module dependency).
 * Replaces IPAction/IPDaoImpl traced in migration doc §4.2.
 * Priority fix while porting: parameterize the string-concatenated HQL in
 * finalizeDischarge/patientDischarge (doc risk R9) - do not port that pattern as-is.
 */
package com.pms.ipadmission;
