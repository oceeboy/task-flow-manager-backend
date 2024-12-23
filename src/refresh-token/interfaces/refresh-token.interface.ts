import { Document } from 'mongoose';

export interface RefreshToken extends Document {
  userId: string;
  token: string;
  expiresAt: Date;
}
