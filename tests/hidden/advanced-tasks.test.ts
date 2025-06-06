import request from "supertest";
import app from "../../src/index";

describe("Security Tests", () => {
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "password123";

  let authToken: string;

  beforeAll(async () => {
    // Register test user once for all tests
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD });
    authToken = res.body.token;
  });

  afterAll(async () => {
    // Clean up test user
    await request(app)
      .delete("/api/auth/cleanup-test-users")
      .send({ testEmail: TEST_EMAIL });
  });

  describe("Security Tests", () => {
    describe("Authentication", () => {
      it("should reject requests without auth token", async () => {
        const res = await request(app).get("/api/tasks");
        expect(res.status).toBe(401);
      });

      it("should reject invalid auth tokens", async () => {
        const res = await request(app)
          .get("/api/tasks")
          .set("Authorization", "Bearer invalid.token.here");
        expect(res.status).toBe(401);
      });
    });

    describe("Input Validation", () => {
      it("should reject malformed task data", async () => {
        const testCases = [
          {},
          { title: "" },
          { title: "   " },
          { title: "Valid", dueDate: "invalid-date" },
          { title: "Valid", priority: "InvalidPriority" },
        ];

        for (const data of testCases) {
          const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send(data);
          expect(res.status).toBe(400);
        }
      });

      it("should sanitize HTML/XSS inputs", async () => {
        const xssPayloads = [
          "<script>alert('xss')</script>",
          "<img src=x onerror=alert('xss')>",
          "<svg/onload=alert('xss')>",
        ];

        for (const payload of xssPayloads) {
          const res = await request(app)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
              title: payload,
              description: "Test description",
            });

          // Either rejects the payload completely (400) or sanitizes it (201)
          if (res.status === 201) {
            expect(res.body.title).not.toContain("<script>");
            expect(res.body.title).not.toContain("onerror");
          } else {
            expect(res.status).toBe(400);
          }
        }
      });
    });

    describe("Authorization", () => {
      it("should prevent access to other users' data", async () => {
        const user2 = await request(app)
          .post("/api/auth/register")
          .send({
            name: "User 2",
            email: "user2@example.com",
            password: "password456",
          });

        const task = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ title: "Private task" });

        const res = await request(app)
          .get(`/api/tasks/${task.body.id}`)
          .set("Authorization", `Bearer ${user2.body.token}`);
        expect([403, 404]).toContain(res.status);
      });
    });
  });
});
