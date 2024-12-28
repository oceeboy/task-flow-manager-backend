import { Schema, Document, Types } from 'mongoose';
import { TaskPriority, TaskStatus } from 'src/common/constants/task.enum';
import { User } from 'src/user/interface/user.interface';

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  assignedTo?: User;
  createdBy?: User;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
export const TaskSchema = new Schema({
  _id: { type: Types.ObjectId, auto: true },
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: {
    type: String,
    required: true,
    enum: Object.values(TaskPriority),
    default: TaskPriority.LOW,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
  },
  assignedTo: { type: Types.ObjectId, ref: 'User' },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
