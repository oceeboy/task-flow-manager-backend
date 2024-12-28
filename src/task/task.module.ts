import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskSchema } from './schemas/task.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { AuditLogSchema } from 'src/audit-log/schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Task', schema: TaskSchema },
      { name: 'User', schema: UserSchema },
      { name: 'AuditLog', schema: AuditLogSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AuditLogModule),
  ],
  providers: [TaskService],
  controllers: [TaskController],
})
export class TaskModule {}
