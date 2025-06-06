import Joi from 'joi';
import { TaskStatus, TaskPriority } from '../models/Task';

//validations are here you can change with your own schema validation library if you want like Zod, ExpressValidator, etc
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(6).max(128).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required(),
});

export const taskCreationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().trim(),
  description: Joi.string().max(1000).optional().trim(),
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  dueDate: Joi.date().optional(),
});

export const taskUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().trim(),
  description: Joi.string().max(1000).optional().trim(),
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  dueDate: Joi.date().optional(),
});

export const taskQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'dueDate', 'priority').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});