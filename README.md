🎯 Expected Fixes
To make this API fully functional, the following must be implemented:

✅ Fix Authentication

Ensure POST /api/auth/login works with valid credentials.

Return a JWT token and user data on success.

✅ Implement Task CRUD Operations

Create Task (POST /api/tasks) → Return 201 with the new task.

List Tasks (GET /api/tasks) → Support filtering (status), pagination (page, limit).

Get Single Task (GET /api/tasks/:id) → Return 200 or 404.

Update Task (PUT /api/tasks/:id) → Modify and return updated task.

Delete Task (DELETE /api/tasks/:id) → Return 204 (success) or 404.

✅ Proper Error Handling

Invalid data → 400 Bad Request

Task not found → 404 Not Found

Unauthorized access → 401 Unauthorized

📌 Success Criteria
The project will be considered fixed when:
✔ All 18 tests pass (no failures).
✔ Authentication works (login returns a valid token).
✔ Task API is fully functional (CRUD operations with proper responses).

🔧 How to Test?
Run the test suite to check progress:

sh
npm run test
This problem statement clearly defines:

What’s broken ❌

What needs to be fixed 🔧

How success is measured 🎯