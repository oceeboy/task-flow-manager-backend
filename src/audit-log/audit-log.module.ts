import { forwardRef, Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogSchema } from './schemas/audit-log.schema';
import { TaskModule } from '../task/task.module';
import { AuditLogController } from './audit-log.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'AuditLog',
        schema: AuditLogSchema,
      },
    ]),
    forwardRef(() => TaskModule),
    forwardRef(() => AuthModule),
  ],
  providers: [AuditLogService],
  exports: [AuditLogService],
  controllers: [AuditLogController],
})
export class AuditLogModule {}
