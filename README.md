# API Fix and Implementation Task

## Overview
You are provided with a partially implemented API. Your goal is to make the API fully functional by fixing the existing issues and implementing the missing features.

This document outlines what needs to be done, how the functionality should behave, and how success is measured.

---

## Expected Fixes

### 1. Fix Authentication

- Ensure the `POST /api/auth/login` endpoint works correctly.
- It should accept valid credentials and return:
  - A valid JWT token.
  - User data on successful login.

### 2. Implement Task CRUD Operations

You need to fully implement the following task-related endpoints:

#### Create Task
- **Endpoint**: `POST /api/tasks`
- **Expected Behavior**: Create a new task.
- **Response**: Return HTTP status `201 Created` with the created task object.

#### List Tasks
- **Endpoint**: `GET /api/tasks`
- **Expected Behavior**: Return a list of tasks.
- **Features**:
  - Support filtering by `status` (e.g., completed, pending).
  - Support pagination using `page` and `limit` query parameters.

#### Get Single Task
- **Endpoint**: `GET /api/tasks/:id`
- **Expected Behavior**: Return the task with the given ID.
- **Response**:
  - Return `200 OK` if the task is found.
  - Return `404 Not Found` if the task does not exist.

#### Update Task
- **Endpoint**: `PUT /api/tasks/:id`
- **Expected Behavior**: Update the task with the given ID.
- **Response**: Return the updated task object with `200 OK`.

#### Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Expected Behavior**: Delete the task with the given ID.
- **Response**:
  - Return `204 No Content` on successful deletion.
  - Return `404 Not Found` if the task does not exist.

---

## Proper Error Handling

Ensure the API returns appropriate error codes and messages:

- Invalid or malformed data → `400 Bad Request`
- Task not found → `404 Not Found`
- Unauthorized access → `401 Unauthorized`

---

## Success Criteria

The implementation is considered complete when the following conditions are met:

- All 17 tests pass with no failures.
- The authentication system works and returns valid JWT tokens.
- All task CRUD operations are implemented and return correct status codes and data.

---
## Install Dependencies
This will install all prerequired packages for your assessment
```sh
npm install
```
## How to Test

Run the test suite using the following command to track your progress:

```sh
npm run test
```
Best of luck!
