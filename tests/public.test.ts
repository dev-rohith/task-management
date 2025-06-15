import request from "supertest";
import app from "../src/index";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";

async function registerAndLoginUser(email = TEST_EMAIL) {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: TEST_PASSWORD,
  });
  return {
    token: res.body.token,
    userId: res.body.user.id,
  };
}

async function createTask(token: string, overrides = {}) {
  const taskData = {
    title: "Sample Task",
    description: "This is a sample task",
    priority: "medium",
    ...overrides,
  };
  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send(taskData);
  return res.body;
}

describe("Authentication Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: TEST_PASSWORD,
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 400 for invalid email", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: TEST_PASSWORD,
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: TEST_PASSWORD,
      };

      await request(app).post("/api/auth/register").send(userData).expect(201);

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe(TEST_EMAIL);
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: TEST_EMAIL, password: "wrong password" })
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});

describe("Task Routes", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    const auth = await registerAndLoginUser();
    authToken = auth.token;
    userId = auth.userId;
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = { title: "Test Task", description: "A test", priority: "high" };
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(res.body.title).toBe(taskData.title);
    });

    it("should return 401 without authentication", async () => {
      await request(app).post("/api/tasks").send({ title: "Task" }).expect(401);
    });

    it("should return 400 for invalid task data", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await createTask(authToken, { title: "Task 1", status: "pending", priority: "low" });
      await createTask(authToken, { title: "Task 2", status: "in_progress", priority: "medium" });
      await createTask(authToken, { title: "Task 3", status: "completed", priority: "high" });
    });

    it("should return all tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.tasks).toHaveLength(3);
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/tasks?status=completed")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.tasks[0].status).toBe("completed");
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/tasks?page=1&limit=2")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.tasks.length).toBeLessThanOrEqual(2);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should get a task by id", async () => {
      const task = await createTask(authToken);
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body._id).toBe(task._id);
    });

    it("should return 404 for invalid id", async () => {
      await request(app)
        .get("/api/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await createTask(authToken);
      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Task", status: "in_progress" })
        .expect(200);

      expect(res.body.title).toBe("Updated Task");
    });

    it("should return 404 for invalid id", async () => {
      await request(app)
        .put("/api/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Task" })
        .expect(404);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await createTask(authToken);
      await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .get(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should return 404 for invalid id", async () => {
      await request(app)
        .delete("/api/tasks/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });
  });
});