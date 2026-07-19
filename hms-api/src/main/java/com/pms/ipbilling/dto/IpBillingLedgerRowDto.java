package com.pms.ipbilling.dto;

import java.util.List;

/** One row of the BILLING breakdown matrix (e.g. "Ward/Bed Charges" or "OT Charges"). */
public record IpBillingLedgerRowDto(
        String category,
        double invoiced,
        double discount,
        double refund,
        double net,
        List<IpBillingLineItemDto> lineItems) {
}
