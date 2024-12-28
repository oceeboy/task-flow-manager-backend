import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ITask } from './schemas/task.schema';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from 'src/user/interface/user.interface';

import { TaskPriority, TaskStatus } from 'src/common/constants/task.enum';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel('Task') private readonly taskModel: Model<ITask>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Helper: Validate task existence
  private async validateTask(taskId: string): Promise<ITask> {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  // Helper: Validate user existence
  private async validateUser(userId: string | Types.ObjectId): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  // Helper method for enum validation
  private isValidEnumValue(value: string, enumType: any): boolean {
    return Object.values(enumType).includes(value);
  }

  // Create Task
  async createTask(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<ITask> {
    const { status, priority, assignedTo } = createTaskDto;

    // Validate status
    if (status && !Object.values(TaskStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values are: ${Object.values(TaskStatus).join(', ')}`,
      );
    }

    // Validate priority
    if (priority && !Object.values(TaskPriority).includes(priority)) {
      throw new BadRequestException(
        `Invalid priority. Allowed values are: ${Object.values(TaskPriority).join(', ')}`,
      );
    }

    // Validate assignedTo if provided
    if (assignedTo && !Types.ObjectId.isValid(assignedTo)) {
      throw new BadRequestException('Invalid assignedTo ID');
    }

    // Create the new task
    const newTask = new this.taskModel({
      ...createTaskDto,
      createdBy: userId, // Set the user who created the task
    });

    const task = await newTask.save();

    // Create audit log

    await this.auditLogService.createAuditLog({
      action: 'Task Created',
      message: `Task created with ID: ${task._id}`,
      performedBy: new Types.ObjectId(userId),
      targetEntity: 'Task',
      target: new Types.ObjectId(task._id),
    });
    return task;
  }

  // Get All Tasks with Filters
  async getAllTasks(filters: any, currentUser: User): Promise<ITask[]> {
    const query: any = {};

    // Add filters
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (currentUser.role !== 'admin') query.createdBy = currentUser._id;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    return this.taskModel
      .find(query)
      .populate({
        path: 'assignedTo',
        select: 'firstName lastName userName _id',
      })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName userName _id',
      })
      .exec();
  }

  // Get Task by ID
  async getTaskById(taskId: string, userId: string): Promise<ITask> {
    // Fetch the task with assignedTo and createdBy populated
    const task = await this.taskModel
      .findById(taskId)
      .populate([
        { path: 'assignedTo', select: 'firstName lastName _id' }, // Populate assignedTo
        { path: 'createdBy', select: 'firstName lastName _id' }, // Populate createdBy
      ])
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Fetch the user making the request
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if the user is authorized to view the task
    const isAdmin = user.role === 'admin';
    const isCreator = task.createdBy._id.toString() === user._id.toString();
    const isAssigned =
      task.assignedTo && // Ensure assignedTo exists
      task.assignedTo._id && // Ensure _id is available in assignedTo
      task.assignedTo._id.toString() === user._id.toString(); // Compare assigned user ID with request user ID

    if (!isAdmin && !isCreator && !isAssigned) {
      throw new UnauthorizedException(
        'You are not authorized to view this task',
      );
    }

    return task;
  }

  // Update Task
  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<ITask> {
    // Validate task existence
    const task = await this.validateTask(taskId);

    // Validate `status` if provided
    if (
      updateTaskDto.status &&
      !this.isValidEnumValue(updateTaskDto.status, TaskStatus)
    ) {
      throw new BadRequestException(
        `Invalid status. Allowed values are: ${Object.values(TaskStatus).join(', ')}`,
      );
    }

    // Validate `priority` if provided
    if (
      updateTaskDto.priority &&
      !this.isValidEnumValue(updateTaskDto.priority, TaskPriority)
    ) {
      throw new BadRequestException(
        `Invalid priority. Allowed values are: ${Object.values(TaskPriority).join(', ')}`,
      );
    }

    updateTaskDto.updatedAt = new Date();

    // Update the task
    const updTask = await this.taskModel
      .findByIdAndUpdate(task._id, updateTaskDto, { new: true })
      .exec();

    await this.auditLogService.createAuditLog({
      action: 'Task Updated',
      message: `Task updated with ID: ${task._id}`,
      performedBy: new Types.ObjectId(task.createdBy._id),
      targetEntity: 'Task',
      target: new Types.ObjectId(task._id),
    });

    return updTask;
  }

  // Delete Task
  async deleteTask(
    taskId: string,
    currentUser: string,
  ): Promise<{ message: string }> {
    const task = await this.validateTask(taskId);
    const userThatRequested = await this.validateUser(currentUser);
    // Access control: Only admins or task creators can assign/reassign tasks

    if (
      userThatRequested.role !== 'admin' &&
      task.createdBy._id.toString() !== userThatRequested._id.toString()
    ) {
      throw new ForbiddenException('Access denied');
    }
    await this.taskModel.findByIdAndDelete(task._id).exec();
    await this.auditLogService.createAuditLog({
      action: 'Task Deleted',
      message: `Task deleted with ID: ${task._id}`,
      performedBy: new Types.ObjectId(userThatRequested._id),
      targetEntity: 'Task',
      target: new Types.ObjectId(task._id),
    });

    return {
      message: 'Task deleted successfully',
    };
  }

  // Assign Task

  async assignTask(
    taskId: string,
    assignedTo: string, // Pass as a string and convert to ObjectId
    currentUser: string,
  ): Promise<ITask> {
    // Validate task existence
    const task = await this.validateTask(taskId);

    // Validate user existence
    const user = await this.validateUser(new Types.ObjectId(assignedTo)); // Convert to ObjectId

    const userThatRequested = await this.validateUser(currentUser);
    // Access control: Only admins or task creators can assign/reassign tasks

    if (
      userThatRequested.role !== 'admin' &&
      task.createdBy._id.toString() !== userThatRequested._id.toString()
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Assign the task
    task.assignedTo = user; // Set directly as User object
    task.updatedAt = new Date();

    await this.auditLogService.createAuditLog({
      action: 'Task Assigned',
      message: `Task assigned with ID: ${task._id}`,
      performedBy: new Types.ObjectId(userThatRequested._id),
      targetEntity: 'Task',
      target: new Types.ObjectId(task._id),
    });

    return task.save();
  }
  // Update Task Status
  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    currentUser: string,
  ): Promise<ITask> {
    const task = await this.validateTask(taskId);

    // Access control: Only admins or assigned users can update the status
    const userThatRequested = await this.validateUser(currentUser);
    // Access control: Only admins or task creators can assign/reassign tasks

    if (
      userThatRequested.role !== 'admin' &&
      task.createdBy._id.toString() !== userThatRequested._id.toString()
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Update status
    task.status = status;
    task.updatedAt = new Date();

    await this.auditLogService.createAuditLog({
      action: 'Task Status Updated',
      message: `Task status updated with ID: ${task._id}`,
      performedBy: new Types.ObjectId(userThatRequested._id),
      targetEntity: 'Task',
      target: new Types.ObjectId(task._id),
    });
    return task.save();
  }
}
