export interface UserProp {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
  otp?: string;
  createdAt?: Date;
}

export interface UserData extends Omit<UserProp, 'password'> {
  fullName: string; // Derived field
}

export interface TokenResponse {
  newAccessToken: string;
}

export interface LogOutResponse {
  message: string;
}
