/**
 * Plain CSS for the Consultant Wise Report printed via a standalone popup
 * window (see ConsultantWiseReportComponent.print()) - same reasoning as
 * appointments/reports/report-print-styles.ts: a popup document has none of
 * the app's compiled styles or CSS custom properties available.
 */
export const REPORT_PRINT_STYLES = `
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    margin: 24px;
  }
  h1 {
    font-size: 1.25rem;
    margin: 0 0 16px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 8px 10px;
    text-align: left;
  }
  td:last-child, th:last-child {
    text-align: right;
  }
  th {
    background: #14707a;
    color: #fff;
  }
  .cwr-total-row {
    font-weight: 700;
    background: #f0f0f0;
  }
`;
