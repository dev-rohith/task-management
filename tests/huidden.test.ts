import request from "supertest";
import app from "../src/index";
import jwt from "jsonwebtoken";

describe("Security Tests", () => {
  const TEST_EMAIL = "test@example.com";
  const TEST_PASSWORD = "password123";

  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD });

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await request(app)
      .delete("/api/auth/cleanup-test-users")
      .send({ testEmail: TEST_EMAIL });
  });

  describe("Authentication", () => {
    it("should reject requests without auth token", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });

    it("should reject invalid JWT tokens", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
    });

    it("should reject expired JWT tokens", async () => {
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "-1h" }
      );

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${expiredToken}`);

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

    it("should prevent NoSQL injection", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: { $ne: null } });

      expect(res.status).toBe(400);
    });

    it("should sanitize HTML content to prevent XSS", async () => {
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
      // Register second user
      const user2 = await request(app).post("/api/auth/register").send({
        name: "User 2",
        email: "user2@example.com",
        password: "password456",
      });

      // Create task as first user
      const task = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Private task" });

      // Try to access task with second user's token
      const res = await request(app)
        .get(`/api/tasks/${task.body.id}`)
        .set("Authorization", `Bearer ${user2.body.token}`);

      expect([403, 404]).toContain(res.status);
    });
  });

  describe("Error Handling", () => {
    it("should not expose sensitive information in errors", async () => {
      const res = await request(app)
        .get("/api/tasks/invalid-id-format")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.stack).toBeUndefined(); // Ensure no internal stack trace
    });
  });
});
