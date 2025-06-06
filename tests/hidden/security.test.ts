// tests/hidden/security.test.ts
import request from "supertest";
import app from "../../src/index";
import jwt from "jsonwebtoken";

describe("Security & Edge Cases", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe("JWT Token Security", () => {
    it("should reject invalid JWT tokens", async () => {
      const invalidTokens = [
        "invalid.token.here",
        "Bearer invalid.token.here",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature",
        "",
        "null",
        "undefined",
      ];

      for (const token of invalidTokens) {
        await request(app)
          .get("/api/tasks")
          .set("Authorization", token)
          .expect(401);
      }
    });

    it("should reject expired JWT tokens", async () => {
      const expiredToken = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "-1h" }
      );

      await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });

    it("should reject tokens with invalid user IDs", async () => {
      const invalidUserToken = jwt.sign(
        { userId: "507f1f77bcf86cd799439011" }, // Non-existent user ID
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${invalidUserToken}`)
        .expect(401);
    });

    it("should handle malformed authorization headers", async () => {
      const malformedHeaders = [
        "Bearer",
        "Bearer ",
        "Basic dGVzdDp0ZXN0",
        "InvalidScheme token",
        authToken, // Without Bearer prefix
      ];

      for (const header of malformedHeaders) {
        await request(app)
          .get("/api/tasks")
          .set("Authorization", header)
          .expect(401);
      }
    });
  });

  describe("Input Validation & Sanitization", () => {
    it("should prevent NoSQL injection attempts", async () => {
      const injectionAttempts = [
        { title: { $ne: null } },
        { title: { $regex: ".*" } },
        { title: { $where: "this.title.length > 0" } },
        { "title[$ne]": null },
        { "title[$regex]": ".*" },
      ];

      for (const attempt of injectionAttempts) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(attempt);

        // Should either reject the request or sanitize the input
        expect([400, 201]).toContain(response.status);

        if (response.status === 201) {
          // If accepted, the malicious payload should be sanitized
          expect(typeof response.body.title).toBe("string");
        }
      }
    });

    it("should handle Unicode and special characters safely", async () => {
      const unicodeData = {
        title: "Test with 🚀 émojis and spéçial chars: ñáéíóú",
        description: "Unicode test: 中文 العربية हिंदी ελληνικά",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(unicodeData)
        .expect(201);

      expect(response.body.title).toBe(unicodeData.title);
      expect(response.body.description).toBe(unicodeData.description);
    });

    it("should prevent prototype pollution attacks", async () => {
      const pollutionAttempts = [
        { "__proto__.isAdmin": true },
        { "constructor.prototype.isAdmin": true },
        { title: "test", __proto__: { polluted: true } },
      ];

      for (const attempt of pollutionAttempts) {
        await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(attempt);
      }

      // Verify that prototype pollution didn't occur
      expect(({} as any).isAdmin).toBeUndefined();
      expect(({} as any).polluted).toBeUndefined();
    });

    it("should handle extremely long strings", async () => {
      const longString = "A".repeat(10000);

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: longString,
          description: longString,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should validate date fields properly", async () => {
      const invalidDates = [
        { dueDate: "invalid-date" },
        { dueDate: "2023-13-45" },
        { dueDate: "not-a-date" },
        { dueDate: 123456789 },
        { dueDate: null },
      ];

      for (const invalidDate of invalidDates) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            title: "Test Task",
            ...invalidDate,
          });

        expect(response.status).toBe(400);
      }
    });
  });

  describe("Rate Limiting & DoS Protection", () => {
    it("should enforce rate limits", async () => {
      const requests = Array.from({ length: 150 }, () =>
        request(app)
          .get("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
      );

      const results = await Promise.allSettled(requests);
      const tooManyRequests = results.filter(
        (result) => result.status === "fulfilled" && result.value.status === 429
      );

      expect(tooManyRequests.length).toBeGreaterThan(0);
    });

    it("should handle concurrent requests gracefully", async () => {
      const concurrentRequests = Array.from({ length: 20 }, (_, i) =>
        request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            title: `Concurrent Task ${i}`,
            description: `Task created concurrently #${i}`,
          })
      );

      const results = await Promise.allSettled(concurrentRequests);
      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value.status === 201
      );

      // Should handle at least some concurrent requests successfully
      expect(successful.length).toBeGreaterThan(0);
    });

    it("should prevent memory exhaustion attacks", async () => {
      const largePayload = {
        title: "Memory Test",
        description: "A".repeat(1000000), // 1MB string
        tags: Array.from({ length: 1000 }, (_, i) => `tag${i}`),
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe("Data Integrity & Edge Cases", () => {
    it("should handle null and undefined values", async () => {
      const nullPayloads = [
        { title: null, description: "Test" },
        { title: "Test", description: null },
        { title: undefined, description: "Test" },
        { title: "Test", description: undefined },
      ];

      for (const payload of nullPayloads) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(payload);

        expect(response.status).toBe(400);
      }
    });

    it("should handle circular references in JSON", async () => {
      const circular: any = { title: "Test" };
      circular.circular = circular;

      // This should be handled by JSON.stringify throwing an error
      let errorThrown = false;
      try {
        await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(circular);
      } catch (error) {
        errorThrown = true;
      }

      expect(errorThrown).toBe(true);
    });

    it("should validate required fields", async () => {
      const incompletePayloads = [
        {}, // Empty object
        { description: "No title" },
        { title: "" }, // Empty title
        { title: "   " }, // Whitespace only
      ];

      for (const payload of incompletePayloads) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(payload);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
      }
    });

    it("should handle database connection issues gracefully", async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the app doesn't crash with invalid operations
      const response = await request(app)
        .get("/api/tasks/invalid-id-format")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Authorization & Access Control", () => {
    it("should prevent access to other users' tasks", async () => {
      // Create another user
      const user2Response = await request(app).post("/api/auth/register").send({
        name: "User 2",
        email: "user2@example.com",
        password: "password456",
      });

      const user2Token = user2Response.body.token;

      // Create a task with user 1
      const taskResponse = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Private Task",
          description: "This should not be accessible to user 2",
        });

      const taskId = taskResponse.body.id;

      // Try to access user 1's task with user 2's token
      const unauthorizedAccess = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(403);

      expect(unauthorizedAccess.body).toHaveProperty("error");
    });

    it("should prevent privilege escalation", async () => {
      // Try to modify system properties or access admin endpoints
      const privilegeAttempts = [
        { title: "Test", isAdmin: true },
        { title: "Test", role: "admin" },
        { title: "Test", permissions: ["admin"] },
      ];

      for (const attempt of privilegeAttempts) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send(attempt);

        if (response.status === 201) {
          // If created, admin properties should be stripped
          expect(response.body.isAdmin).toBeUndefined();
          expect(response.body.role).toBeUndefined();
          expect(response.body.permissions).toBeUndefined();
        }
      }
    });
  });

  describe("Error Handling & Information Disclosure", () => {
    it("should not expose sensitive information in error messages", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: {
            $where: 'throw new Error("Database error with sensitive info")',
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).not.toContain(
        "Database error with sensitive info"
      );
      expect(response.body.error).not.toContain("stack trace");
      expect(response.body.error).not.toContain("file path");
    });

    it("should handle server errors gracefully", async () => {
      // Test with malformed MongoDB ObjectId
      const response = await request(app)
        .get("/api/tasks/not-a-valid-object-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Invalid task ID format");
    });

    it("should return consistent error formats", async () => {
      const errorResponses = [
        await request(app).get("/api/tasks").expect(401), // No auth
        await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send({})
          .expect(400), // Invalid data
        await request(app)
          .get("/api/tasks/invalid-id")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(400), // Invalid ID
      ];

      for (const response of errorResponses) {
        expect(response.body).toHaveProperty("error");
        expect(typeof response.body.error).toBe("string");
        expect(response.body.error.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Content Security & XSS Prevention", () => {
    it("should sanitize HTML content in task fields", async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<svg onload="alert(1)">',
        '"><script>alert("xss")</script>',
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post("/api/tasks")
          .set("Authorization", `Bearer ${authToken}`)
          .send({
            title: `XSS Test: ${payload}`,
            description: payload,
          });

        if (response.status === 201) {
          // XSS payloads should be sanitized or escaped
          expect(response.body.title).not.toContain("<script>");
          expect(response.body.description).not.toContain("<script>");
          expect(response.body.title).not.toContain("javascript:");
          expect(response.body.description).not.toContain("javascript:");
        }
      }
    });

    it("should set appropriate security headers", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`);

      // Check for security headers (these should be set by helmet or similar middleware)
      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers).toHaveProperty("x-frame-options");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });
  });

  afterEach(async () => {
    // Clean up test data if needed
    try {
      await request(app)
        .delete("/api/auth/cleanup-test-users")
        .send({ testEmail: "test@example.com" });
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });
});
