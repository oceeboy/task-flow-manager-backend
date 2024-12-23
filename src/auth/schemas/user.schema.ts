import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [String], default: ['user'] },
  otp: { type: String },
  otpExpiration: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
