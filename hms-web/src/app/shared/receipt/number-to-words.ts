const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen'
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) {
    return ONES[n];
  }
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ' ' + ONES[ones] : '');
}

function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) {
    parts.push(ONES[hundreds] + ' Hundred');
  }
  if (rest) {
    parts.push(twoDigits(rest));
  }
  return parts.join(' ');
}

/** Indian numbering (thousand/lakh/crore) - whole rupees only, for a receipt's "Received sum of Rupees ___ Only" line. */
export function numberToWords(amount: number): string {
  if (amount <= 0) {
    return 'Zero';
  }
  let remaining = Math.floor(amount);
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundred = remaining;

  const parts: string[] = [];
  if (crore) {
    parts.push(threeDigits(crore) + ' Crore');
  }
  if (lakh) {
    parts.push(threeDigits(lakh) + ' Lakh');
  }
  if (thousand) {
    parts.push(threeDigits(thousand) + ' Thousand');
  }
  if (hundred) {
    parts.push(threeDigits(hundred));
  }
  return parts.join(' ');
}
