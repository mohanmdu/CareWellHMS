package com.pms.reporting.dto;

/** CEO/MD Dashboard's OP Revenue donut chart. Unlike the IP side, Lab and Radiology are split here. */
public record CeoOpRevenueDto(double consultingFee, double lab, double radiology, double pharmacy, double other, double total) {
}
