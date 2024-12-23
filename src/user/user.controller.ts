import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
// import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
