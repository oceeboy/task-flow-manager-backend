import { Schema } from 'mongoose';
import { Role } from '../../common/constants/role.enum';

export const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(Role), default: Role.User }, // Default role is user
  otp: { type: String },
  otpExpiration: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
