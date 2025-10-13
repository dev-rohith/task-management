import mongoose from 'mongoose';

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const taskSchema = new mongoose.Schema({

}, {

});


export const Task = mongoose.model('Task', taskSchema);
