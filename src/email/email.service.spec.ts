import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer'); // Mock the nodemailer module

describe('EmailService', () => {
  let emailService: EmailService;
  let sendMailMock: jest.Mock;

  beforeAll(() => {
    // Mock the transporter with a sendMail function
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send OTP email with correct options', async () => {
    const email = 'test@example.com';
    const name = 'John Doe';
    const otp = '123456';

    await emailService.sendOtpToEmailUsingNodeMailer(email, name, otp);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Reset Your Password -TaskFlow Manager',
      html: expect.stringContaining(otp),
    });
  });

  it('should send email verification link with correct options', async () => {
    const email = 'test@example.com';
    const name = 'John Doe';
    const token = 'verification_token';

    process.env.BASE_URL = 'http://localhost:3000/verify?token='; // Mock the BASE_URL environment variable

    await emailService.emailVerificationLink(email, name, token);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Vaildate your Email -TaskFlow Manager',
      html: expect.stringContaining(`${process.env.BASE_URL}${token}`),
    });
  });

  it('should send profile update email with correct options', async () => {
    const email = 'test@example.com';
    const name = 'John Doe';
    const content = 'Your profile was updated.';

    await emailService.profileUpdateChangesToMail(email, name, content);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Profile Updated -TaskFlow Manager',
      html: expect.stringContaining(content),
    });
  });
});
