import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { TaskPriority, TaskStatus } from 'src/common/constants/task.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: High, Medium, Low',
  })
  @IsNotEmpty()
  priority: TaskPriority;

  @IsEnum(TaskStatus, {
    message: 'Status must be one of: Pending, In Progress, Completed',
  })
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assignedTo?: Types.ObjectId;

  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  createdBy?: Types.ObjectId;
}
