import { ForgotPasswordDto } from './dto/forgot-password.dto';

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { LogOutResponse, TokenResponse, UserData } from '../types';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailService } from '../email/email.service';
import { User } from '../user/interface/user.interface';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly emailService: EmailService,
  ) {}

  // Generate access token
  generateAccessToken(user: User): string {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESSTOKENEXPIRATION,
    }); // Access token expires in 5 minutes
  }

  // Generate refresh toke
  generateRefreshToken(user: User): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESHTOKENEXPIRATION,
    }); // Refresh token expires in 7 days
  }

  // User registration
  async registerUser(
    registerUser: RegisterUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password, ...rest } = registerUser;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 15);

    // Save new user to the database

    // this will be change to using the service of User and all the use of prisima
    const newUser = new this.userModel({
      ...rest,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = this.generateRefreshToken(savedUser);

    // Store refresh token in the database
    await this.refreshTokenService.create(
      savedUser._id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return { accessToken, refreshToken };
  }

  // User login
  async loginUser(
    loginUser: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUser;

    // Validate user credentials
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in the database
    await this.refreshTokenService.create(
      user._id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return { accessToken, refreshToken };
  }

  // Get user data
  async getUserDatas(userid: string): Promise<UserData> {
    const user = await this.userModel
      .findById(userid)
      .select('-password')
      .lean<User>()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      fullName: `${user.firstName} ${user.lastName}`,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      userName: user.userName,
    };
  }

  // Refresh access token using refresh token
  async refreshAccessToken(
    refreshToken: RefreshTokenDto,
  ): Promise<TokenResponse> {
    try {
      const decoded = this.jwtService.verify(refreshToken.refreshToken);

      // Validate refresh token in the database
      const isValid = await this.refreshTokenService.isTokenValid(
        decoded.sub,
        refreshToken.refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Find user and generate a new access token
      const user = await this.userModel.findById(decoded.sub).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newAccessToken = this.generateAccessToken(user);

      return {
        newAccessToken: newAccessToken,
      };
    } catch (error: unknown) {
      throw new UnauthorizedException(
        `Could not refresh access token: ${(error as Error).message}`,
      );
    }
  }

  // logout
  async logoutUser(refreshTokenDto: RefreshTokenDto): Promise<LogOutResponse> {
    try {
      // Decode the refresh token
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Find the refresh token in the database
      const refreshToken = await this.refreshTokenService.findByUserIdAndToken(
        decoded.sub,
        refreshTokenDto.refreshToken,
      );

      if (!refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete the refresh token
      await this.refreshTokenService.deleteById(refreshToken._id.toString());

      return {
        message: 'Logged out successfully',
      };
    } catch (error: unknown) {
      throw new UnauthorizedException(
        `Could not logout: ${(error as Error).message}`,
      );
    }
  }

  // delete all sessions everywhere

  async deleteSessions(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LogOutResponse> {
    try {
      // Decode the refresh token
      const decoded = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Find the refresh token in the database
      const refreshToken = await this.refreshTokenService.findByUserIdAndToken(
        decoded.sub,
        refreshTokenDto.refreshToken,
      );

      if (!refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete the refresh token of all session
      await this.refreshTokenService.deleteAllByUserId(refreshToken.userId);

      return {
        message: 'Logged out successfully',
      };
    } catch (error: unknown) {
      throw new UnauthorizedException(
        `Could not logout: ${(error as Error).message}`,
      );
    }
  }

  // forget password

  async forgetPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    // this Generates a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // this does what the function is named
    // await this.sendOtpToEmailUsingNodeMailer(user.email, user.firstName, otp);

    // using the email.service.ts

    await this.emailService.sendOtpToEmailUsingNodeMailer(
      user.email,
      user.firstName,
      otp,
    );

    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await user.save();

    return {
      message: 'OTP sent to your email',
    };
  }

  async verifyOtpTokenToChangePassword(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    const { email, otp, newPassword } = verifyOtpDto;
    const user = await this.userModel.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiration) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    // after get the token is validated the new password is to be hashed
    user.password = await bcrypt.hash(newPassword, 15);

    // after password has been hashed the otp has no use so it needs to be clear of the database

    user.otp = undefined;

    await user.save();

    return {
      message: 'Password updated successfully',
    };
  }
}
