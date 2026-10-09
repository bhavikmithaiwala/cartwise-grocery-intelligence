const base = process.env.SMOKE_ORIGIN ?? "http://127.0.0.1:3001";
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
for (const path of ["/", "/receipts"]) {
  const response = await fetch(base + path);
  check(response.ok, "Built SPA must serve successfully");
  check(
    (await response.text()).includes("<title>CartWise"),
    "Built SPA title missing",
  );
}
const health = await fetch(base + "/api/health");
check(health.ok, "Compiled API health failed");
const login = await fetch(base + "/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CartWise-Request": "1",
    Origin: base,
  },
  body: JSON.stringify({
    email: "demo@cartwise.test",
    password: "CartWise-demo-2026!",
  }),
});
check(login.ok, "Fictional demo login failed");
const cookie = login.headers.getSetCookie()[0]?.split(";")[0];
check(cookie, "Session cookie missing");
async function get(path: string) {
  const response = await fetch(base + "/api" + path, {
    headers: { Cookie: cookie },
  });
  check(response.ok, `Smoke endpoint failed: ${path}`);
  return response.json();
}
const receipts = await get("/receipts");
check(
  receipts.total === 4,
  "Seed should contain exactly four fictional receipts after repeated seed",
);
const products = await get("/products");
check(
  products.length === 2,
  "Seed should contain two mapped fictional products",
);
const history = await get("/prices/history?productId=" + products[0].id);
check(
  history.length === 4,
  "Seed should contain four historical observations per product",
);
const now = new Date(),
  month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const summary = await get("/reports/overview?month=" + month);
check(
  summary.receiptCount === 2 && summary.totalCents > 0,
  "Seeded current month analytics failed",
);
console.log(
  "Compiled SPA routes, API login, repeatable four-receipt seed, mapped history and current-month reporting smoke passed.",
);
