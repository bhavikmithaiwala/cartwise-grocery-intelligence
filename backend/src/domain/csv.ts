export function csvCell(value: string | number) {
  let text = String(value);
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function receiptCsv(
  rows: {
    id: string;
    rawMerchant: string;
    purchaseDate: string;
    totalCents: number;
    taxCents: number;
  }[],
) {
  return (
    [
      [
        "receipt_id",
        "merchant",
        "purchase_date",
        "currency",
        "total_cents",
        "tax_cents",
      ],
      ...rows.map((r) => [
        r.id,
        r.rawMerchant,
        r.purchaseDate,
        "CAD",
        r.totalCents,
        r.taxCents,
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n") + "\r\n"
  );
}
