package com.pms.pharmacy.service;

import com.pms.pharmacy.repository.PharmacySaleRepository;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

/** Same AtomicLong sequence pattern as PurchaseOrderNumberService/InvoiceNumberService, seeded from MAX(bill_number). */
@Service
public class PharmacyBillNumberService {

    private final AtomicLong sequence;

    public PharmacyBillNumberService(PharmacySaleRepository repository) {
        Long max = repository.findMaxBillNumber();
        this.sequence = new AtomicLong(max != null ? max : 0L);
    }

    public long next() {
        return sequence.incrementAndGet();
    }
}
