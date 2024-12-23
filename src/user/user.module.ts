import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from './user.service';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   {
    //     name: 'User',
    //     schema: UserSchema,
    //   },
    // ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
