import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiOperation({ summary: 'To register a user' })
  @ApiBody({
    description: 'User details to register',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        accessToken: 'string',
        refreshToken: 'string',
      },
    },
  })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  // this is for the login
  @Post('login')
  @ApiOperation({ summary: 'To login User' })
  @ApiBody({
    description: 'User details to Login',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'user successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  //create a @Get function to get the user data such as all he registered with
  @Get('me')
  @UseGuards(AuthGuard)
  async getUserData(@Request() req) {
    return this.authService.getUserDatas(req.user?.sub);
  }
  @Post('refresh')
  async getNewToken(@Body() refreshToken: RefreshTokenDto) {
    return await this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Body() refreshToken: RefreshTokenDto) {
    return await this.authService.logoutUser(refreshToken);
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgetPassword(forgotPasswordDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP',
  })
  @ApiBody({
    description: 'Verify OTP',
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string' },
        email: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async verifyToken(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtpTokenToChangePassword(verifyOtpDto);
  }
}
