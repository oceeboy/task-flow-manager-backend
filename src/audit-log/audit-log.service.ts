import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { AuditLog } from './schemas/audit-log.schema';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel('AuditLog') private readonly auditLogModel: Model<AuditLog>,
  ) {}

  // Create a new audit log
  async createAuditLog(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditLogModel.create(createAuditLogDto);
  }

  // Retrieve audit logs with optional filters
  async getAuditLogs(filters: Partial<AuditLog>): Promise<AuditLog[]> {
    const query: FilterQuery<AuditLog> = this.buildFilterQuery(filters);
    return this.auditLogModel.find(query).exec();
  }

  // Retrieve a specific audit log by ID
  async getAuditLogById(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogModel.findById(id).exec();
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID "${id}" not found`);
    }
    return auditLog;
  }

  // Helper to build dynamic filter queries
  private buildFilterQuery(filters: Partial<AuditLog>): FilterQuery<AuditLog> {
    const query: FilterQuery<AuditLog> = {};

    if (filters.action) {
      query.action = filters.action;
    }

    if (filters.performedBy) {
      query.performedBy = filters.performedBy;
    }

    if (filters.targetEntity) {
      query.targetEntity = filters.targetEntity;
    }

    if (filters.target) {
      query.target = filters.target;
    }

    if (filters.timestamp) {
      query.timestamp = { $gte: filters.timestamp }; // Example for filtering by timestamp range
    }

    return query;
  }
}
