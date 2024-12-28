import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';

import { EmailModule } from './email/email.module';

import { UserModule } from './user/user.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
import { TaskModule } from './task/task.module';
import { AuditLogModule } from './audit-log/audit-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    AuthModule,
    RefreshTokenModule,
    EmailModule,
    TaskModule,
    AuditLogModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'), // Serve files from the 'public' directory
    // }),
  ],
  controllers: [AppController],
  providers: [AppService], // only the appservic should be here
})
export class AppModule {}
