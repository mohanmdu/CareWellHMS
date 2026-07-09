/**
 * MIS / Reports module (Migration Plan Phase 2, order 7 - trails other modules).
 * Replaces AdminAction/IPAction dashboard & report methods (migration doc §4.6).
 * The legacy app has no server-side report engine - Apache POI is already a
 * dependency for master-data Excel import and should be reused for export;
 * add OpenPDF/iText for real server-rendered PDFs instead of the legacy
 * client-side jsPDF/html2canvas table-screenshot approach.
 */
package com.pms.reporting;
