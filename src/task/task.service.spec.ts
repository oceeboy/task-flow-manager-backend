import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { ITask } from './schemas/task.schema';
import { User } from 'src/user/interface/user.interface';

/*```there are some issues with the code that need to be fixed before the tests can pass. Fix the issues in the code and write the missing test cases.```;*/

describe('TaskService', () => {
  let taskService: TaskService;
  let userModel: Model<User>;
  let taskModel: Model<ITask>;

  const mockTaskModel = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockTask = {
    _id: 'taskId',
    title: 'Test Task',
    description: 'Task Description',
    status: 'pending',
    priority: 'medium',
    assignedTo: new mongoose.Types.ObjectId('64f3c2b4e4e3c8f68d7c7a9a'),
    createdBy: '64f3c2b4e4e3c8f68d7c7b01',
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getModelToken('Task'), useValue: mockTaskModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskModel = module.get<Model<ITask>>(getModelToken('Task'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a task successfully', async () => {
    mockUserModel.findById.mockResolvedValueOnce({ _id: mockTask.assignedTo });
    mockTaskModel.create.mockResolvedValueOnce(mockTask);

    const createTaskDto = {
      title: 'Test Task',
      description: 'Task Description',
      priority: 'medium',
      assignedTo: '64f3c2b4e4e3c8f68d7c7a9a',
    };

    const result = await taskService.createTask(
      createTaskDto,
      mockTask.createdBy,
    );

    expect(result).toEqual(mockTask);
    expect(mockUserModel.findById).toHaveBeenCalledWith(mockTask.assignedTo);
    expect(mockTaskModel.create).toHaveBeenCalledWith({
      ...createTaskDto,
      createdBy: mockTask.createdBy,
    });
  });

  it('should throw NotFoundException if the assigned user does not exist', async () => {
    mockUserModel.findById.mockResolvedValueOnce(null);

    const createTaskDto = {
      title: 'Test Task',
      description: 'Task Description',
      priority: 'medium',
      assignedTo: '64f3c2b4e4e3c8f68d7c7a9a',
    };

    await expect(
      taskService.createTask(createTaskDto, mockTask.createdBy),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserModel.findById).toHaveBeenCalledWith(mockTask.assignedTo);
  });

  it('should get all tasks', async () => {
    mockTaskModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([mockTask]),
    });

    const filters = { assignedTo: mockTask.assignedTo };
    const currentUser = { _id: mockTask.createdBy, role: 'admin' };

    const result = await taskService.getAllTasks(filters, currentUser);

    expect(result).toEqual([mockTask]);
    expect(mockTaskModel.find).toHaveBeenCalledWith({
      assignedTo: mockTask.assignedTo,
    });
  });

  it('should get a task by id', async () => {
    mockTaskModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(mockTask),
    });

    const currentUser = { _id: mockTask.createdBy, role: 'user' };
    const result = await taskService.getTaskById(mockTask._id, currentUser);

    expect(result).toEqual(mockTask);
    expect(mockTaskModel.findById).toHaveBeenCalledWith(mockTask._id);
  });

  it('should throw NotFoundException when task is not found by id', async () => {
    mockTaskModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(null),
    });

    const currentUser = { _id: mockTask.createdBy, role: 'user' };

    await expect(
      taskService.getTaskById('nonExistentId', currentUser),
    ).rejects.toThrow(NotFoundException);

    expect(mockTaskModel.findById).toHaveBeenCalledWith('nonExistentId');
  });

  it('should update a task successfully', async () => {
    const updateTaskDto = { title: 'Updated Task' };
    mockTaskModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce({ ...mockTask, ...updateTaskDto }),
    });

    const result = await taskService.updateTask(mockTask._id, updateTaskDto);

    expect(result).toEqual({ ...mockTask, ...updateTaskDto });
    expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockTask._id,
      updateTaskDto,
      { new: true },
    );
  });

  it('should delete a task successfully', async () => {
    mockTaskModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockTask),
    });

    await taskService.deleteTask(mockTask._id);

    expect(mockTaskModel.findByIdAndDelete).toHaveBeenCalledWith(mockTask._id);
  });

  it('should assign a task to a user successfully', async () => {
    mockTaskModel.findById.mockResolvedValueOnce(mockTask);
    mockUserModel.findById.mockResolvedValueOnce({ _id: mockTask.assignedTo });
    mockTaskModel.save = jest.fn().mockResolvedValueOnce(mockTask);

    const currentUser = { _id: mockTask.createdBy, role: 'admin' };

    const result = await taskService.assignTask(
      mockTask._id,
      mockTask.assignedTo,
      currentUser,
    );

    expect(result).toEqual(mockTask);
    expect(mockTaskModel.findById).toHaveBeenCalledWith(mockTask._id);
    expect(mockUserModel.findById).toHaveBeenCalledWith(mockTask.assignedTo);
  });

  it('should throw ForbiddenException when assigning a task without permission', async () => {
    mockTaskModel.findById.mockResolvedValueOnce(mockTask);
    const currentUser = { _id: 'nonCreatorUserId', role: 'user' };

    await expect(
      taskService.assignTask(mockTask._id, mockTask.assignedTo, currentUser),
    ).rejects.toThrow(ForbiddenException);

    expect(mockTaskModel.findById).toHaveBeenCalledWith(mockTask._id);
  });
});
