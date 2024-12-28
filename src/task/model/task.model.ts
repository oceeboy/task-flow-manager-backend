import { model } from 'mongoose';
import { ITask, TaskSchema } from '../schemas/task.schema';

export const Task = model<ITask>('Task', TaskSchema);
