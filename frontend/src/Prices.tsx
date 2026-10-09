import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import { Field, Notice, Empty, money } from "./ui";
interface Product {
  id: string;
  name: string;
  unitFamily: string;
}
interface Observation {
  id: string;
  merchant: string;
  purchaseDate: string;
  centsPerUnit: string;
  normalizedUnit: string;
  normalizedQuantityDecimal: string;
  lineTotalCents: number;
  sourceReceiptId: string;
}
export function PricesScreen() {
  const [comparisons, setComparisons] = useState<
    {
      merchant: string;
      unit: string;
      count: number;
      lowestCentsPerUnit: string;
      date: string;
      sourceReceiptId: string;
    }[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<Observation[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api<Product[]>(`/products?q=${encodeURIComponent(search)}`)
      .then(setProducts)
      .catch((err) => setError(err.message));
  }, [search]);
  useEffect(() => {
    if (!selected) {
      setRows([]);
      return;
    }
    let active = true;
    const q = new URLSearchParams({ productId: selected });
    if (unit) q.set("unit", unit);
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    api<Observation[]>(`/prices/history?${q}`)
      .then((data) => {
        if (active) {
          setRows(data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [selected, unit, from, to]);
  useEffect(() => {
    if (selected)
      api<typeof comparisons>(
        "/prices/compare?productId=" + encodeURIComponent(selected),
      )
        .then(setComparisons)
        .catch((err) => setError(err.message));
    else setComparisons([]);
  }, [selected]);
  const max = Math.max(1, ...rows.map((r) => Number(r.centsPerUnit)));
  return (
    <>
      <p className="eyebrow">YOUR RECEIPTS, YOUR PRICE SIGNALS</p>
      <h1>Historical price notebook</h1>
      <p>
        Verified prices you recorded, with source dates. These are not live
        retail prices.
      </p>
      <div className="card row">
        <Field
          label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="field">
          Product
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose a mapped product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unitFamily})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Comparable unit
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">All units (separate groups)</option>
            {["g", "ml", "each"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <Field
          label="From date"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Field
          label="To date"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <section className="card">
        <h2>Lowest recorded price by store and unit</h2>
        <p className="muted">
          Each unit is a separate comparison group. Historical observations
          only.
        </p>
        {comparisons.map((c) => (
          <p key={c.merchant + c.unit}>
            <strong>{c.merchant}</strong> · {c.lowestCentsPerUnit} cents/
            {c.unit} · {c.count} observations ·{" "}
            <Link to={"/receipts/" + c.sourceReceiptId}>{c.date}</Link>
          </p>
        ))}
      </section>
      {error && <Notice error>{error}</Notice>}
      {rows.length < 2 && (
        <Notice>
          Not enough observations to identify a trend. Map the same product on
          multiple confirmed receipts.
        </Notice>
      )}
      {!rows.length ? (
        <Empty title="No recorded prices yet">
          <p>Choose a product or map verified receipt items during review.</p>
        </Empty>
      ) : (
        <section className="card table-scroll">
          <h2>Recorded observations</h2>
          <table>
            <thead>
              <tr>
                <th>Date / source</th>
                <th>Merchant</th>
                <th>Quantity</th>
                <th>Paid CAD</th>
                <th>Cents / unit</th>
                <th>Price trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link to={`/receipts/${r.sourceReceiptId}`}>
                      {r.purchaseDate}
                    </Link>
                  </td>
                  <td>{r.merchant}</td>
                  <td>
                    {r.normalizedQuantityDecimal} {r.normalizedUnit}
                  </td>
                  <td>{money(r.lineTotalCents)}</td>
                  <td>
                    {r.centsPerUnit} / {r.normalizedUnit}
                  </td>
                  <td>
                    <div
                      className="chart-bar"
                      role="img"
                      aria-label={`${r.centsPerUnit} cents per ${r.normalizedUnit}`}
                      style={{
                        width: `${(Number(r.centsPerUnit) / max) * 100}%`,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
