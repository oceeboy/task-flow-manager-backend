import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuditLogService } from './audit-log.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Types } from 'mongoose';

describe('AuditLogService', () => {
  let auditService: AuditLogService;

  // Mocked methods for the Mongoose model
  const mockAuditLogModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    auditService = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock call history after each test
  });

  describe('createAuditLog', () => {
    it('should create an audit log', async () => {
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
      mockAuditLogModel.create.mockResolvedValue(mockResponse);
      const result = await auditService.createAuditLog(dto);

      expect(mockAuditLogModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);

      mockAuditLogModel.create.mockResolvedValue(mockResponse);

      expect(mockAuditLogModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAuditLogs', () => {
    it('should retrieve audit logs with filters', async () => {
      const filters = { action: 'testAction' };
      const mockResponse = [
        { _id: '123', action: 'testAction', performedBy: 'user1' },
      ];

      mockAuditLogModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await auditService.getAuditLogs(filters);

      expect(mockAuditLogModel.find).toHaveBeenCalledWith({
        action: 'testAction',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAuditLogById', () => {
    it('should return a specific audit log by ID', async () => {
      const id = '123';
      const mockResponse = {
        _id: id,
        action: 'testAction',
        performedBy: 'user1',
      };

      mockAuditLogModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await auditService.getAuditLogById(id);

      expect(mockAuditLogModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if audit log is not found', async () => {
      const id = '123';

      mockAuditLogModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null), // Simulate no result found
      });

      await expect(auditService.getAuditLogById(id)).rejects.toThrow(
        new NotFoundException(`Audit log with ID "${id}" not found`),
      );

      expect(mockAuditLogModel.findById).toHaveBeenCalledWith(id);
    });
  });
});
