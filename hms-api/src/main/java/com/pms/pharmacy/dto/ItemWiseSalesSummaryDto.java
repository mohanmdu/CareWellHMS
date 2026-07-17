package com.pms.pharmacy.dto;

import java.util.List;

public record ItemWiseSalesSummaryDto(
        String productName, String batch, Double mrp, Integer saleQty, Double netAmount, List<ItemWiseSalesDetailDto> details) {
}
