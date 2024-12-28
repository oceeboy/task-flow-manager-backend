import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from 'src/common/constants/task.enum';

@Controller('task')
@UseGuards(AuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Create a new task
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    const userId = req.user.sub; // Logged-in user's ID
    return this.taskService.createTask(createTaskDto, userId);
  }

  // Retrieve all tasks with optional filters
  @Get()
  async getAllTasks(
    @Request() req: any, // Extracted user from request
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.taskService.getAllTasks(
      { assignedTo, status, priority },
      req.user,
    );
  }

  // Retrieve a task by ID
  @Get(':id')
  async getTaskById(@Param('id') id: string, @Request() req: any) {
    return this.taskService.getTaskById(id, req.user?.sub);
  }

  // Update a task
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  // Delete a task
  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Request() req: any) {
    return this.taskService.deleteTask(id, req.user.sub);
  }

  // Assign a task to a user
  @Patch(':id/assign')
  async assignTask(
    @Param('id') id: string,
    @Body('assignedTo') assignedTo: string,
    @Request() req: any,
  ) {
    return this.taskService.assignTask(id, assignedTo, req.user.sub);
  }

  // Update the status of a task
  @Patch(':id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @Request() req: any,
  ) {
    return this.taskService.updateTaskStatus(id, status, req.user.sub);
  }
}
