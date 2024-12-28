import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Types } from 'mongoose';
import { TaskPriority, TaskStatus } from 'src/common/constants/task.enum';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority, {
    message: 'Priority must be one of: High, Medium, Low',
  })
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus, {
    message: 'Status must be one of: Pending, In Progress, Completed',
  })
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  createdBy?: Types.ObjectId;
}
