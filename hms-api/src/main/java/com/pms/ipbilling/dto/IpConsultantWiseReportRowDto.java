package com.pms.ipbilling.dto;

/** One row of the IP Consultant Wise Report - net billed amount (invoiced - discount - refund) for one consultant. */
public record IpConsultantWiseReportRowDto(
        Long consultantId, String consultantName, String specializationName, double amount) {
}
