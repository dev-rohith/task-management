import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface ITask extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: mongoose.Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/*
TODO: Complete the Task schema
Requirements:
1. title: required string, trimmed
2. description: optional string
3. status: required, default to PENDING, validate against TaskStatus enum
4. priority: required, default to MEDIUM, validate against TaskPriority enum
5. userId: required ObjectId reference to User model
6. dueDate: optional Date
7. Add timestamps
8. Create compound index on userId and status for better query performance
*/

const taskSchema = new Schema<ITask>({
  // TODO: Implement schema fields here
}, {
  // TODO: Add schema options (timestamps, etc.)
});

// TODO: Add indexes for better query performance
// Consider: userId + status, userId + priority, dueDate

export const Task = mongoose.model<ITask>('Task', taskSchema);