import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service'; // Import the service
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('AuditLogController', () => {
  let controller: AuditLogController;

  const mockAuditLogModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        AuditLogService,
        {
          provide: getModelToken('AuditLog'), // Use getModelToken for Mongoose models
          useValue: mockAuditLogModel, // Provide the mock implementation
        },
        {
          provide: JwtService,
          useValue: {}, // Mock JwtService
        },
        {
          provide: Reflector,
          useValue: {}, // Mock Reflector
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock call history after each test
  });
  describe('AuditLogController - test method', () => {
    it('should return void without errors', async () => {
      // Ensure the mock method returns as expected

      // Act
      const result = await controller.test();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  // this is to create an audit from the admin manualy
  describe('AuthLogController - @Get/audit-log', () => {
    it('should create an audit', async () => {
      const dto = {
        action: 'testAction',
        message: 'testMessage',
        performedBy: new Types.ObjectId('5f64f0f3f4f5c0e3f8f3f4f5'),
        target: new Types.ObjectId('5f64f0f3f4f5c0e3f8f3f4f5'),
        targetEntity: 'Task',
        // timestamp: '2021-01-01T00:00:00.000Z',
      };
      const mockResponse = {
        _id: '123',
        action: 'testAction',
        performedBy: 'user1',
      };

      await controller.createAuditLog(dto);
      mockAuditLogModel.create.mockResolvedValue(mockResponse);

      expect(mockAuditLogModel.create).toHaveBeenCalledWith(dto);
      // expect(result).toEqual(mockResponse); // there is nothing to return
    });
  });
});
