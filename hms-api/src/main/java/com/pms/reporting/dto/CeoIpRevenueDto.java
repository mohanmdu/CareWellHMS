package com.pms.reporting.dto;

/** CEO/MD Dashboard's IP Revenue pie chart. labXray is combined (no Radiology split needed on the IP side). */
public record CeoIpRevenueDto(double labXray, double pharmacy, double roomRent, double consultingFee, double other, double total) {
}
