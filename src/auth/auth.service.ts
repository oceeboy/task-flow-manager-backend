import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
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
import { User } from 'src/auth/interface/user.interface';
import { LogOutResponse, TokenResponse, UserData } from 'src/types';

import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly emailService: EmailService,
  ) {}

  // Generate access token
  generateAccessToken(user: User): string {
    const payload = { email: user.email, sub: user._id, roles: user.roles };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.ACCESSTOKENEXPIRATION || '5m',
    }); // Access token expires in 5 minutes
  }

  // Generate refresh toke
  generateRefreshToken(user: User): string {
    const payload = { sub: user._id };
    return this.jwtService.sign(payload, {
      expiresIn: process.env.REFRESHTOKENEXPIRATION || '7d',
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
      roles: user.roles,
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

  // sending otp
  // async sendOtpToEmailUsingNodeMailer(
  //   email: string,
  //   name: string,
  //   otp: string,
  // ) {
  //   const transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       user: process.env.MAILER_EMAIL_FOR_NODEMAILER,
  //       pass: process.env.MAILER_PASSORD_FOR_NODEMAILER,
  //     },
  //   });

  //   // Email template with custom logo, colors, and fonts
  //   const mailOptions = {
  //     from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
  //     to: email,
  //     subject: 'Reset Your Password - TaskFlow Manager',
  //     html: `
  //       <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  //         <div style="text-align: center; margin-bottom: 20px;">
  //           <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;" />
  //         </div>
  //         <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
  //         <h2> Hi ${name} </h2>
  //         <p style="color: #555; line-height: 1.6; text-align: center;">
  //           Use the OTP below to reset your password. If you did not request this, please ignore this email.
  //         </p>
  //         <div style="text-align: center; margin: 20px 0;">
  //           <span style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 4px;">
  //             ${otp}
  //           </span>
  //         </div>
  //         <p style="color: #777; font-size: 14px; text-align: center;">
  //           This OTP is valid for 10 minutes. Do not share it with anyone.
  //         </p>
  //         <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
  //         <p style="color: #999; font-size: 12px; text-align: center;">
  //           © ${new Date().getFullYear()} TaskFlow Manager. All rights reserved.
  //         </p>
  //       </div>
  //     `,
  //   };

  //   // Send the email
  //   await transporter.sendMail(mailOptions);
  // }
  // Verify otp and allow changing of password

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
