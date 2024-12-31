import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { RefreshToken } from './interfaces/refresh-token.interface';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return this.refreshTokenModel.create({ userId, token, expiresAt });
  }

  async findByUserIdAndToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null> {
    return this.refreshTokenModel.findOne({ userId, token }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.refreshTokenModel.deleteOne({ _id: id });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId });
  }

  async isTokenValid(userId: string, token: string): Promise<boolean> {
    const refreshToken = await this.findByUserIdAndToken(userId, token);
    if (!refreshToken) {
      return false; // Token not found
    }

    // Explicitly cast _id to ObjectId
    const tokenId = new mongoose.Types.ObjectId(refreshToken._id as string);

    // Check if the token has expired
    if (refreshToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.deleteById(tokenId.toString()); // Ensure _id is converted to string
      return false; // Token is expired
    }

    return true; // Token is valid
  }
}
