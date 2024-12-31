import { RegisterUserDto } from './dto/register-user.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { EmailService } from '../email/email.service';
import { User } from '../user/interface/user.interface';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            create: jest.fn(),
            isTokenValid: jest.fn(),
            findByUserIdAndToken: jest.fn(),
            deleteById: jest.fn(),
            deleteAllByUserId: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendOtpToEmailUsingNodeMailer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    jwtService = module.get<JwtService>(JwtService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  describe('loginUser', () => {
    it('should throw UnauthorizedException if email is invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'password',
      };
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = {
        email: 'test@test.com',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(userModel, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return access and refresh tokens if credentials are valid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = {
        _id: 'userId',
        email: 'test@test.com',
        password: 'hashedPassword',
      } as User;
      jest.spyOn(userModel, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(service, 'generateAccessToken').mockReturnValue('accessToken');
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockReturnValue('refreshToken');
      jest.spyOn(refreshTokenService, 'create').mockResolvedValue(null);

      const result = await service.loginUser(loginUserDto);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  // create for the register using the co pillot solution
  describe('registerUser', () => {
    it('should throw Unauthorized if email is aleady in use', async () => {
      const registerUserDto: RegisterUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        userName: 'johndoe', // Add this field
        email: 'test@test.com',
        password: 'securePassword',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(registerUserDto);
      await expect(service.registerUser(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should hash password before sending to database', async () => {});
  });

  describe('getUserDatas', () => {
    it('should throw NotFoundException if user id is wrong', async () => {
      const userId = '123';
      const user = {
        _id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        role: 'user',
        userName: 'johndoe',
      } as User;
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      await expect(service.getUserDatas(user._id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user data if user id is correct', async () => {
      const userId = '123';
      const user = {
        _id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        role: 'user',
        userName: 'johndoe',
      } as User;
      jest.spyOn(userModel, 'findById').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      const result = await service.getUserDatas(user._id);

      expect(result).toEqual({
        fullName: 'John Doe',
        _id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        role: 'user',
        userName: 'johndoe',
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };
      const decodedToken = { sub: 'userId' };
      const user = { _id: 'userId', email: 'test@example.com', role: 'user' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(refreshTokenService, 'isTokenValid').mockResolvedValue(true);
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);
      jest
        .spyOn(service, 'generateAccessToken')
        .mockReturnValue('newAccessToken');

      const result = await service.refreshAccessToken(refreshTokenDto);

      expect(result).toEqual({ newAccessToken: 'newAccessToken' });
      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenService.isTokenValid).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );
      expect(userModel.findById).toHaveBeenCalledWith(decodedToken.sub);
      expect(service.generateAccessToken).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalidRefreshToken',
      };
      const decodedToken = { sub: 'userId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(refreshTokenService, 'isTokenValid').mockResolvedValue(false);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenService.isTokenValid).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };
      const decodedToken = { sub: 'userId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(refreshTokenService, 'isTokenValid').mockResolvedValue(true);
      jest.spyOn(userModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      await expect(service.refreshAccessToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userModel.findById).toHaveBeenCalledWith(decodedToken.sub);
    });
  });

  // logout user
  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };
      const decodedToken = { sub: 'userId' };
      const refreshToken = { _id: 'refreshTokenId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest
        .spyOn(refreshTokenService, 'findByUserIdAndToken')
        .mockResolvedValue(refreshToken as any);
      jest
        .spyOn(refreshTokenService, 'deleteById')
        .mockResolvedValue(undefined);

      const result = await service.logoutUser(refreshTokenDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenService.findByUserIdAndToken).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenService.deleteById).toHaveBeenCalledWith(
        refreshToken._id.toString(),
      );
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalidRefreshToken',
      };
      const decodedToken = { sub: 'userId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest
        .spyOn(refreshTokenService, 'findByUserIdAndToken')
        .mockResolvedValue(null);

      await expect(service.logoutUser(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenService.findByUserIdAndToken).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException if an error occurs', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.logoutUser(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  //deletesession

  describe('deleteSessions', () => {
    it('should logout user successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };
      const refreshToken = { userId: 'userId123', token: 'validRefreshToken' };
      const decodedToken = { sub: 'userId' };
      // const refreshToken = { _id: 'refreshTokenId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest
        .spyOn(refreshTokenService, 'findByUserIdAndToken')
        .mockResolvedValue(refreshToken as any);
      jest
        .spyOn(refreshTokenService, 'deleteAllByUserId')
        .mockResolvedValue(undefined);

      const result = await service.deleteSessions(refreshTokenDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(jwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(refreshTokenService.findByUserIdAndToken).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );

      expect(refreshTokenService.deleteAllByUserId).toHaveBeenCalledWith(
        refreshToken.userId,
      );
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalidRefreshToken',
      };
      const decodedToken = { sub: 'userId' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(decodedToken);
      jest
        .spyOn(refreshTokenService, 'findByUserIdAndToken')
        .mockResolvedValue(null);

      await expect(service.deleteSessions(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(refreshTokenService.findByUserIdAndToken).toHaveBeenCalledWith(
        decodedToken.sub,
        refreshTokenDto.refreshToken,
      );
    });

    it('should throw UnauthorizedException if an error occurs', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.logoutUser(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
