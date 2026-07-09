/**
 * Pharmacy & Inventory module (Migration Plan Phase 2, order 5 - largest module,
 * budget the most time). Replaces PharmacyAction/PharmacyDaoImpl (10.8K/16.7K LOC)
 * traced in migration doc §4.3.
 * Priority fix while porting: stock decrement must use optimistic locking
 * (@Version) or a DB constraint instead of the legacy unlocked bulk HQL UPDATE
 * (doc risk R10) to prevent overselling under concurrent dispensing.
 */
package com.pms.pharmacy;
