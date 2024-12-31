import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthModel = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    getUserDatas: jest.fn(),
    refreshAccessToken: jest.fn(),
    logoutUser: jest.fn(),
    forgetPassword: jest.fn(),
    verifyOtpTokenToChangePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthModel,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('', () => {
    it('', async () => {});
  });
});
