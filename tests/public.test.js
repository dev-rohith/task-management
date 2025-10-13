import request from "supertest";
import app from "../src/app.js";

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

async function createTask(token, overrides = {}) {
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
  return res.body.task; 
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
  let authToken;
  let userId;

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

      expect(res.body.task.title).toBe(taskData.title);
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await createTask(authToken, { title: "Task 1" });
      await createTask(authToken, { title: "Task 2" });
    });

    it("should return all tasks", async () => {
      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.tasks).toHaveLength(2);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should get a task by id", async () => {
      const task = await createTask(authToken);
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.task._id).toBe(task._id);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await createTask(authToken);
      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated Task" })
        .expect(200);

      expect(res.body.task.title).toBe("Updated Task");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const task = await createTask(authToken);
      await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
    });
  });
});




