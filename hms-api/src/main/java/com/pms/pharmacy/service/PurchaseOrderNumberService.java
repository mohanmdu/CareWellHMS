package com.pms.pharmacy.service;

import com.pms.pharmacy.repository.PurchaseOrderRepository;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

/**
 * Single-table version of InvoiceNumberService's pattern - in-memory/per-JVM
 * sequence seeded from MAX(po_number), same provisional local-dev posture as
 * every other sequence in this codebase.
 */
@Service
public class PurchaseOrderNumberService {

    private final AtomicLong sequence;

    public PurchaseOrderNumberService(PurchaseOrderRepository repository) {
        Long max = repository.findMaxPoNumber();
        this.sequence = new AtomicLong(max != null ? max : 0L);
    }

    public long next() {
        return sequence.incrementAndGet();
    }
}
