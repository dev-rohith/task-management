import request from "supertest";
import app from "../../src/index";
import jwt from "jsonwebtoken";

describe("Security Tests", () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
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

  describe("Authentication Security", () => {
    it("should reject invalid JWT tokens", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);
    });

    it("should reject expired JWT tokens", async () => {
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "-1h" }
      );
      
      await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe("Input Validation", () => {
    it("should prevent NoSQL injection", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: { $ne: null } })
        .expect(400);
    });

    it("should sanitize HTML content to prevent XSS", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: '<script>alert("xss")</script>',
          description: '<img src="x" onerror="alert(1)">'
        });
      
      if (response.status === 201) {
        expect(response.body.title).not.toContain("<script>");
        expect(response.body.description).not.toContain("onerror");
      }
    });
  });

  describe("Authorization", () => {
    it("should prevent access to other users' data", async () => {
      // Create another user
      const user2 = await request(app).post("/api/auth/register").send({
        name: "User 2",
        email: "user2@example.com",
        password: "password456",
      });

      // Create task with first user
      const task = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Private task" });

      // Try to access with second user
      await request(app)
        .get(`/api/tasks/${task.body.id}`)
        .set("Authorization", `Bearer ${user2.body.token}`)
        .expect(403);
    });
  });

  describe("Error Handling", () => {
    it("should not expose sensitive information in errors", async () => {
      const response = await request(app)
        .get("/api/tasks/invalid-id-format")
        .set("Authorization", `Bearer ${authToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.stack).toBeUndefined();
    });
  });

  afterAll(async () => {
    // Clean up test user
    await request(app)
      .delete("/api/auth/cleanup-test-users")
      .send({ testEmail: "test@example.com" });
  });
});