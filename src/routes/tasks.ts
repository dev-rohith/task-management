// src/routes/tasks.ts
import express, { Response } from 'express';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { authenticate, AuthRequest } from '../middleware/auth';
import { taskCreationSchema, taskUpdateSchema, taskQuerySchema } from '../utils/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// TODO: Implement GET /api/tasks - Get all tasks for authenticated user
// Requirements:
// 1. Support pagination (page, limit)
// 2. Support filtering by status, priority
// 3. Support sorting (sortBy: createdAt, updatedAt, dueDate, priority)
// 4. Support search in title and description
// 5. Return tasks in proper format with metadata (total, page, pages)

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement task retrieval with filters, pagination, and sorting
    res.status(200).json({ message: 'TODO: Implement GET /tasks' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Implement GET /api/tasks/:id - Get specific task
// Requirements:
// 1. Validate task ID format
// 2. Check if task exists and belongs to user
// 3. Return 404 if not found

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement single task retrieval
    res.status(200).json({ message: 'TODO: Implement GET /tasks/:id' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Implement POST /api/tasks - Create new task
// Requirements:
// 1. Validate request body using taskCreationSchema
// 2. Set default values for status (PENDING) and priority (MEDIUM)
// 3. Associate task with authenticated user
// 4. Return created task

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement task creation
    res.status(201).json({ message: 'TODO: Implement POST /tasks' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Implement PUT /api/tasks/:id - Update existing task
// Requirements:
// 1. Validate task ID format
// 2. Validate request body using taskUpdateSchema
// 3. Check if task exists and belongs to user
// 4. Update only provided fields
// 5. Return updated task

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement task update
    res.status(200).json({ message: 'TODO: Implement PUT /tasks/:id' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Implement DELETE /api/tasks/:id - Delete task
// Requirements:
// 1. Validate task ID format
// 2. Check if task exists and belongs to user
// 3. Delete the task
// 4. Return success message

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement task deletion
    res.status(200).json({ message: 'TODO: Implement DELETE /tasks/:id' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// TODO: Implement GET /api/tasks/stats - Get task statistics
// Requirements:
// 1. Return counts by status (pending, in_progress, completed)
// 2. Return counts by priority (low, medium, high)
// 3. Return overdue tasks count
// 4. Return total tasks count

router.get('/stats/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement task statistics
    res.status(200).json({ message: 'TODO: Implement GET /tasks/stats/summary' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as taskRoutes };