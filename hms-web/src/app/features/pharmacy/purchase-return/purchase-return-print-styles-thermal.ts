/**
 * Thermal (narrow receipt-printer width) Purchase Return Receipt layout -
 * ~80mm roll width, small font, stacked rows instead of a wide table.
 */
export const PURCHASE_RETURN_PRINT_STYLES_THERMAL = `
  body {
    font-family: Consolas, 'Courier New', monospace;
    color: #000;
    margin: 4px;
    font-size: 11px;
    width: 280px;
  }
  .purchase-return-receipt {
    width: 100%;
  }
  .purchase-return-header-row {
    text-align: center;
    margin-bottom: 4px;
  }
  .purchase-return-title {
    text-align: center;
    font-weight: 700;
    margin: 4px 0;
    border-top: 1px dashed #000;
    border-bottom: 1px dashed #000;
    padding: 2px 0;
  }
  .purchase-return-meta {
    display: flex;
    justify-content: space-between;
    margin: 1px 0;
  }
  .purchase-return-supplier-card {
    margin: 4px 0;
    border-top: 1px dashed #000;
    padding-top: 4px;
  }
  .purchase-return-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4px;
    font-size: 10px;
  }
  .purchase-return-items-table th,
  .purchase-return-items-table td {
    padding: 2px;
    text-align: left;
    border-bottom: 1px dotted #000;
  }
  .purchase-return-items-table th:last-child,
  .purchase-return-items-table td:last-child {
    text-align: right;
  }
  .purchase-return-totals {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-weight: 700;
    border-top: 1px dashed #000;
    padding-top: 4px;
  }
  .purchase-return-signature {
    text-align: center;
    margin-top: 12px;
    border-top: 1px dashed #000;
    padding-top: 4px;
  }
  @media print {
    body { margin: 0; }
  }
`;
