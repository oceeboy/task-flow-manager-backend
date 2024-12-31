import { Document } from 'mongoose';
import { Role } from '../../common/constants/role.enum';

export interface User extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: Role;
  otp?: string;
  otpExpiration?: Date;
  createdAt?: Date;
}
