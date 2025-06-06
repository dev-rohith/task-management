import request from "supertest";
import app from "../../src/index";
import { Response } from "supertest";

// Constants & Helpers
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";

let authToken: string;
let userId: string;

const registerTestUser = async (email = TEST_EMAIL) => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email, password: TEST_PASSWORD });

  return {
    token: res.body.token,
    userId: res.body.user.id,
  };
};

const authRequest = () =>
  request(app).set("Authorization", `Bearer ${authToken}`);

const expectBadRequest = (res: Response) => {
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("error");
};

const expectUnauthorized = (res: Response) => {
  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty("error");
};

const xssPayloads = [
  "<script>alert('xss')</script>",
  "<img src=x onerror=alert('xss')>",
  "<svg/onload=alert('xss')>",
];

const invalidDates = ["2023-13-01", "not-a-date", "2023-02-30"];

const malformedHeaders = [
  "Bearer",
  "Bearer ",
  "Basic dGVzdDp0ZXN0",
  "InvalidScheme token",
  TEST_PASSWORD,
];

beforeEach(async () => {
  const { token, userId: id } = await registerTestUser();
  authToken = token;
  userId = id;
});

afterAll(async () => {
  // Replace with your cleanup route or logic
  await request(app)
    .delete("/api/auth/cleanup-test-users")
    .send({ testEmail: TEST_EMAIL });
});

// Authentication & Headers
describe("Security Tests", () => {
  test.each(malformedHeaders)("Rejects malformed auth header: %s", async (header) => {
    const res = await request(app).get("/api/tasks").set("Authorization", header);
    expectUnauthorized(res);
  });

  test("Rejects request without Authorization header", async () => {
    const res = await request(app).get("/api/tasks");
    expectUnauthorized(res);
  });
});

// Input Validation Tests
describe("Input Validation", () => {
  test("Rejects invalid dates", async () => {
    for (const date of invalidDates) {
      const res = await authRequest().post("/api/tasks").send({
        title: "Test",
        description: "Test Desc",
        dueDate: date,
        priority: "High",
      });
      expectBadRequest(res);
    }
  });

  test("Rejects unsupported priority", async () => {
    const res = await authRequest().post("/api/tasks").send({
      title: "Test",
      description: "Test Desc",
      dueDate: "2025-12-31",
      priority: "Extreme", // invalid
    });
    expectBadRequest(res);
  });

  test("Rejects empty or missing required fields", async () => {
    const res = await authRequest().post("/api/tasks").send({});
    expectBadRequest(res);
  });
});

// XSS Injection Attempts
describe("XSS Injection Protection", () => {
  test.each(xssPayloads)("Rejects XSS title: %s", async (payload) => {
    const res = await authRequest().post("/api/tasks").send({
      title: payload,
      description: "XSS test",
      dueDate: "2025-12-31",
      priority: "Medium",
    });
    expectBadRequest(res);
  });

  test.each(xssPayloads)("Rejects XSS description: %s", async (payload) => {
    const res = await authRequest().post("/api/tasks").send({
      title: "XSS",
      description: payload,
      dueDate: "2025-12-31",
      priority: "Medium",
    });
    expectBadRequest(res);
  });
});

//Rate Limiting (optional, simulate 429 if enabled)
describe.skip("Rate Limiting", () => {
  test("Should block after 100 requests", async () => {
    const requests = Array.from({ length: 101 }, () =>
      authRequest().get("/api/tasks")
    );
    const results = await Promise.all(requests);
    const rateLimitHit = results.find((res) => res.status === 429);
    expect(rateLimitHit).toBeDefined();
  });
});
