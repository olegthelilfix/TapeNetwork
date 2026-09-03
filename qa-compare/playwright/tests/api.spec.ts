import { test, expect, request } from "@playwright/test";

// Pure API test — no browser. Hits the BACKEND (default :8080), not the UI host.
// Set API_URL to run it; skipped otherwise (e.g. in the UI-only CI job).
const API = process.env.API_URL;
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@tape.local";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "password";

test("new ticker created via admin API appears in admin and public API", async () => {
  test.skip(!API, "set API_URL (e.g. http://localhost:8080) to run API tests");
  const api = await request.newContext({ baseURL: API });

  // 1. authenticate against the private API
  const login = await api.post("/api/admin/auth/login", { data: { email: EMAIL, password: PASSWORD } });
  expect(login.ok(), "login failed — check ADMIN_EMAIL / ADMIN_PASSWORD").toBeTruthy();
  const token: string = (await login.json()).token;
  const headers = { Authorization: `Bearer ${token}` };

  // 2. create a ticker via the private API (needs auth)
  const symbol = `E2E-${Date.now()}`;
  const create = await api.post("/api/admin/ticker", {
    headers,
    data: { symbol, price: "100.0", change: "+1.0", direction: "up", sort: 0 },
  });
  expect(create.ok()).toBeTruthy();
  const created = await create.json();
  expect(created.symbol).toBe(symbol);
  const id: number = created.id;

  try {
    // 3. readable back through the private API
    const one = await api.get(`/api/admin/ticker/${id}`, { headers });
    expect(one.ok()).toBeTruthy();
    expect((await one.json()).symbol).toBe(symbol);

    // 4. and it surfaced in the public API (no auth) — also proves cache eviction on write
    const pub = await api.get("/api/v1/ticker");
    expect(pub.ok()).toBeTruthy();
    const symbols = (await pub.json()).map((t: { symbol: string }) => t.symbol);
    expect(symbols).toContain(symbol);
  } finally {
    // 5. cleanup
    await api.delete(`/api/admin/ticker/${id}`, { headers });
    await api.dispose();
  }
});
