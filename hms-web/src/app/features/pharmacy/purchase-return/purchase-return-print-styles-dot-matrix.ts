/**
 * Dot Matrix Purchase Return Receipt layout - same plain-CSS popup print
 * pattern as pharmacy-bill-print-styles.ts.
 */
export const PURCHASE_RETURN_PRINT_STYLES_DOT_MATRIX = `
  body {
    font-family: Consolas, 'Courier New', monospace;
    color: #000;
    margin: 16px;
    font-size: 12px;
  }
  .purchase-return-receipt {
    border: 1px solid #000;
    padding: 12px;
  }
  .purchase-return-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .purchase-return-title {
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    text-decoration: underline;
    margin: 6px 0;
  }
  .purchase-return-meta {
    display: flex;
    justify-content: space-between;
    margin: 2px 0;
  }
  .purchase-return-supplier-card {
    border: 1px solid #000;
    padding: 6px;
    margin: 6px 0;
  }
  .purchase-return-items-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 6px;
  }
  .purchase-return-items-table th,
  .purchase-return-items-table td {
    border: 1px solid #000;
    padding: 3px 4px;
    text-align: left;
  }
  .purchase-return-items-table th:last-child,
  .purchase-return-items-table td:last-child {
    text-align: right;
  }
  .purchase-return-totals {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
    font-weight: 700;
  }
  .purchase-return-signature {
    text-align: right;
    margin-top: 24px;
  }
  @media print {
    body { margin: 0; }
    .purchase-return-receipt { border: none; }
  }
`;
