package com.pms.ipbilling.dto;

/** One room-occupancy period's charge (PDF: "Ward & Room No / Day Count / Invoiced Amount" breakdown after a Ward Change). */
public record WardStayDto(String roomNumber, String roomTypeName, double dayCount, double invoicedAmount) {
}
