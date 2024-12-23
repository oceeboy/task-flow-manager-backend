import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
