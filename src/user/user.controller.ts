import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { EditProfileDto } from './dto/edit-profile.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/constants/role.enum';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
  @Get('me')
  async getUsersData(@Request() req) {
    return this.userService.getUserDatas(req.user?.sub);
  }

  @Patch(':id')
  async editProfile(
    @Param('id') id: string,
    @Body() editProfileDto: EditProfileDto,
  ) {
    return this.userService.editProfile(id, editProfileDto);
  }
  @Get('test')
  @Roles(Role.Admin)
  findAll() {
    return 'List of all tasks (visible to admins only)';
  }
  @Delete('all')
  async deleteAllUsers() {
    return this.userService.deleteAllUsers();
  }
}
