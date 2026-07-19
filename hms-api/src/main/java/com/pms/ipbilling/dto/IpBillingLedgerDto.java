package com.pms.ipbilling.dto;

import java.util.List;

public record IpBillingLedgerDto(
        List<IpBillingLedgerRowDto> rows,
        double netInvoiced,
        double netDiscount,
        double netRefund,
        double netTotal) {
}
