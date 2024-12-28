import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { RegisterUserDto } from '../auth/dto/register-user.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';
import { User } from './interface/user.interface';
import { UserData } from 'src/types';
import { EditProfileDto } from './dto/edit-profile.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private readonly emailService: EmailService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, ...rest } = registerUserDto;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 15);

    // Create new user
    const newUser = new this.userModel({
      ...rest,
      email,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async setOtp(email: string, otp: string): Promise<void> {
    const user = await this.findUserByEmail(email);

    user.otp = otp;
    user.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
    await user.save();
  }

  async verifyOtpAndChangePassword(verifyOtpDto: VerifyOtpDto): Promise<void> {
    const { email, otp, newPassword } = verifyOtpDto;

    const user = await this.findUserByEmail(email);

    if (!user || user.otp !== otp || new Date() > user.otpExpiration) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(newPassword, 15);
    user.otp = null; // Clear OTP
    user.otpExpiration = null; // Clear expiration
    await user.save();
  } // Get user data
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
      userName: user.userName,
      email: user.email,
      role: user.role,
    };
  }

  async editProfile(id: string, userData: EditProfileDto): Promise<User> {
    const allowedUpdates = ['firstName', 'lastName', 'userName', 'email'];
    const updates = Object.keys(userData);
    const isValidOperation = updates.every((field) =>
      allowedUpdates.includes(field),
    );

    if (!isValidOperation) {
      throw new BadRequestException('Invalid updates!');
    }

    // Fetch the existing user
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Track changes
    const changes: string[] = [];
    updates.forEach((field) => {
      if (userData[field] !== existingUser[field]) {
        changes.push(
          `${field} was updated from '${existingUser[field]}' to '${userData[field]}'`,
        );
      }
    });

    // Update the user document
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: userData }, // Use $set to update only specific fields
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Send email notification if changes were made
    if (changes.length > 0) {
      const emailContent = `The following changes were made to your profile:\n\n${changes.join(
        '\n',
      )}`;

      await this.emailService.profileUpdateChangesToMail(
        updatedUser.email,
        updatedUser.firstName,
        emailContent,
      );
    }

    return updatedUser;
  }
  // Delete all users from the database
  async deleteAllUsers(): Promise<{ deletedCount: number }> {
    const result = await this.userModel.deleteMany({});
    return { deletedCount: result.deletedCount };
  }
  // get every user
  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().select('-password').exec();
  }
}
