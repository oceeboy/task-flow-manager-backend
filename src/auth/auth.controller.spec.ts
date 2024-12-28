// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { RegisterUserDto } from './dto/register-user.dto';
// import { LoginUserDto } from './dto/login-user.dto';
// import { RefreshTokenDto } from './dto/refresh-token.dto';
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { VerifyOtpDto } from './dto/verify-otp.dto';

describe('AuthController', () => {
  // let controller: AuthController;
  // let authService: AuthService;
  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [AuthController],
  //     providers: [
  //       {
  //         provide: AuthService,
  //         useValue: {
  //           registerUser: jest.fn(),
  //           loginUser: jest.fn(),
  //           getUserDatas: jest.fn(),
  //           refreshAccessToken: jest.fn(),
  //           logoutUser: jest.fn(),
  //           forgetPassword: jest.fn(),
  //           verifyOtpTokenToChangePassword: jest.fn(),
  //         },
  //       },
  //     ],
  //   }).compile();
  //   controller = module.get<AuthController>(AuthController);
  //   authService = module.get<AuthService>(AuthService);
  // });
  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });
  // it('should register a user', async () => {
  //   const registerUserDto: RegisterUserDto = {
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     userName: 'johndoe',
  //     email: 'john.doe@example.com',
  //     password: 'password',
  //   };
  //   const result = { accessToken: 'accessToken', refreshToken: 'refreshToken' };
  //   jest.spyOn(authService, 'registerUser').mockResolvedValue(result);
  //   expect(await controller.registerUser(registerUserDto)).toBe(result);
  // });
  // it('should login a user', async () => {
  //   const loginUserDto: LoginUserDto = {
  //     email: 'john.doe@example.com',
  //     password: 'password',
  //   };
  //   const result = { accessToken: 'accessToken', refreshToken: 'refreshToken' };
  //   jest.spyOn(authService, 'loginUser').mockResolvedValue(result);
  //   expect(await controller.loginUser(loginUserDto)).toBe(result);
  // });
  // it('should get user data', async () => {
  //   const req = { user: { sub: 'userId' } };
  //   const result = {
  //     id: 'userId',
  //     email: 'john.doe@example.com',
  //     fullName: 'John Doe',
  //     _id: 'userId',
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     role: 'user',
  //   };
  //   jest.spyOn(authService, 'getUserDatas').mockResolvedValue(result);
  //   expect(await controller.getUserData(req)).toBe(result);
  // });
  // it('should refresh token', async () => {
  //   const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refreshToken' };
  //   const result = {
  //     newAccessToken: 'newAccessToken',
  //   };
  //   jest.spyOn(authService, 'refreshAccessToken').mockResolvedValue(result);
  //   expect(await controller.getNewToken(refreshTokenDto)).toBe(result);
  // });
  // it('should logout a user', async () => {
  //   const refreshTokenDto: RefreshTokenDto = { refreshToken: 'refreshToken' };
  //   const result = { message: 'Logged out successfully' };
  //   jest.spyOn(authService, 'logoutUser').mockResolvedValue(result);
  //   expect(await controller.logout(refreshTokenDto)).toBe(result);
  // });
  // it('should handle forgot password', async () => {
  //   const forgotPasswordDto: ForgotPasswordDto = {
  //     email: 'john.doe@example.com',
  //   };
  //   const result = { message: 'OTP sent to email' };
  //   jest.spyOn(authService, 'forgetPassword').mockResolvedValue(result);
  //   expect(await controller.forgetPassword(forgotPasswordDto)).toBe(result);
  // });
  // it('should verify OTP', async () => {
  //   const verifyOtpDto: VerifyOtpDto = {
  //     otp: '123456',
  //     email: 'john.doe@example.com',
  //     newPassword: 'newPassword',
  //   };
  //   const result = { message: 'OTP verified successfully' };
  //   jest
  //     .spyOn(authService, 'verifyOtpTokenToChangePassword')
  //     .mockResolvedValue(result);
  //   expect(await controller.verifyToken(verifyOtpDto)).toBe(result);
  // });
});
