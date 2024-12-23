import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    RefreshTokenModule,
    EmailModule,
    UserModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'), // Serve files from the 'public' directory
    // }),
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, UserService],
})
export class AppModule {}
