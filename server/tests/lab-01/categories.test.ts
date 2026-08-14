import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

// Issue 4 — write this test yourself, using health.test.ts as the pattern.
describe("GET /api/categories", () => {
  it("returns the four seeded categories in id order", async () => {
    // 1. Send a GET request to the API
    const response = await request(app).get("/api/categories");

    // 2. Assert that the HTTP status code is exactly 200
    expect(response.status).toBe(200);

    // 3. Assert that the response exactly matches the 4 seeded categories in order[cite: 2]
    expect(response.body).toEqual([
      { id: 1, name: "Account and Access" },
      { id: 2, name: "Hardware" },
      { id: 3, name: "Software" },
      { id: 4, name: "Network" }
    ]);
  });
});