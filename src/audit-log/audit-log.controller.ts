import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLog } from './schemas/audit-log.schema';
import { AuthGuard } from '../common/guards/auth.guard';
import { Types } from 'mongoose';

@Controller('audit-log')
@UseGuards(AuthGuard) // Protect routes with authentication
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  // Create an audit log entry
  @Post()
  async createAuditLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditLogService.createAuditLog(createAuditLogDto);
  }

  // Retrieve audit logs with optional filters
  @Get()
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('performedBy') performedBy?: Types.ObjectId,
    @Query('targetEntity') targetEntity?: string,
    @Query('target') target?: Types.ObjectId,
    @Query('timestamp') timestamp?: Date,
  ): Promise<AuditLog[]> {
    const filters = {
      action,
      performedBy,
      targetEntity,
      target,
      timestamp,
    };

    return this.auditLogService.getAuditLogs(filters);
  }

  // Retrieve a specific audit log by ID
  @Get(':id')
  async getAuditLogById(@Param('id') id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogService.getAuditLogById(id);
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID "${id}" not found`);
    }
    return auditLog;
  }
}
