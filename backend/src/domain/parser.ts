export interface Extraction {
  merchant: string; purchaseDate: string; subtotalCents?: number; taxCents?: number; totalCents?: number;
  rawText: string; warnings: string[];
}
function price(value: string) {
  const clean = value.replace(/O/gi, '0').replace(',', '.');
  if (!/^\d{1,7}\.\d{2}$/.test(clean)) return undefined;
  const [whole, fraction] = clean.split('.');
  return Number(whole) * 100 + Number(fraction);
}
export function parseReceipt(text: string): Extraction {
  const rows = text.slice(0, 30_000).split(/\r?\n/).map(row => row.trim()).filter(Boolean);
  const result: Extraction = { merchant: rows[0]?.slice(0, 120) ?? '', purchaseDate: '', rawText: text.slice(0, 30_000), warnings: ['Every extracted field is an unverified suggestion.'] };
  for (const row of rows) {
    const date = row.match(/\b(20\d{2})[-/]([01]\d)[-/]([0-3]\d)\b/);
    if (date) result.purchaseDate = `${date[1]}-${date[2]}-${date[3]}`;
    const amount = row.match(/([\dO]{1,7}[.,]\d{2})\s*$/i);
    if (!amount) continue;
    const cents = price(amount[1]);
    if (/^\s*sub\s*total\b/i.test(row)) result.subtotalCents = cents;
    else if (/^\s*(tax|hst|gst)\b/i.test(row)) result.taxCents = (result.taxCents ?? 0) + (cents ?? 0);
    else if (/^\s*(grand\s+total|total)\b/i.test(row)) result.totalCents = cents;
    if (/O\.[0-9]/i.test(amount[1])) result.warnings.push('Possible letter O corrected to zero; verify the amount.');
  }
  if (!result.purchaseDate) result.warnings.push('Purchase date missing or ambiguous. Enter the local receipt date.');
  if (result.totalCents === undefined) result.warnings.push('Total not detected. Do not assume the line sum is the receipt total.');
  return result;
}
