import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { TaskModule } from 'src/task/task.module';
// import { RefreshTokenSchema } from './schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
      signOptions: { expiresIn: '3h' },
    }),
    forwardRef(() => RefreshTokenModule), // Use forwardRef to resolve circular dependency
    forwardRef(() => EmailModule),
    forwardRef(() => UserModule),
    forwardRef(() => TaskModule),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
