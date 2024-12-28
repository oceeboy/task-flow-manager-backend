import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      pass: process.env.MAILER_PASSORD_FOR_NODEMAILER,
    },
  });

  // this for otp sending
  async sendOtpToEmailUsingNodeMailer(
    email: string,
    name: string,
    otp: string,
  ) {
    const mailOptions = {
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Reset Your Password -TaskFlow Manager',
      html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;" />
            </div>
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <h2> Hi ${name} </h2>
            <p style="color: #555; line-height: 1.6; text-align: center;">
              Use the OTP below to reset your password. If you did not request this, please ignore this email.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 4px;">
                ${otp}
              </span>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center;">
              This OTP is valid for 10 minutes. Do not share it with anyone.
            </p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} TaskFlow Manager. All rights reserved.
            </p>
          </div>
        `,
    };

    // Send the email
    await this.transporter.sendMail(mailOptions);
  }

  // this is to be futher done later when the application is built as it an advance security feature
  async emailVerificationLink(email: string, name: string, token: string) {
    const baseUrl = process.env.BASE_URL;

    const url = `${baseUrl}${token}`;

    const mailOptions = {
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Vaildate your Email -TaskFlow Manager',
      html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="TASK_FLOW_MANAGER" alt="TASK_FLOW_LOGO" style="max-width: 150px;" />
            </div>
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <h2> Hi ${name} </h2>
            <p style="color: #555; line-height: 1.6; text-align: center;">
              Click on the button to verify your email If you did not request this, please ignore this email.
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <button href="${url}" style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 4px;">
              Verify email
              </button>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center;">
              This OTP is valid for 10 minutes. Do not share it with anyone.
            </p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} TaskFlow Manager. All rights reserved.
            </p>
          </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // to log event thats happens for changes to the client email
  async profileUpdateChangesToMail(
    email: string,
    name: string,
    content: string,
  ) {
    const mailOptions = {
      from: process.env.MAILER_EMAIL_FOR_NODEMAILER,
      to: email,
      subject: 'Profile Updated -TaskFlow Manager',
      html: `
         <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="TASK_FLOW_MANAGER" alt="TASK_FLOW_LOGO" style="max-width: 150px;" />
            </div>
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <h2> Hi ${name} </h2>
            <p style="color: #555; line-height: 1.6; text-align: center;">
              ${content} if this changes were not made by you click the bellow 
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <button href="" style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 4px;">
              Verify email
              </button>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center;">
              This OTP is valid for 10 minutes. Do not share it with anyone.
            </p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              © ${new Date().getFullYear()} TaskFlow Manager. All rights reserved.
            </p>
          </div>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

// this email service will need more improvement on the ui which i will forcus on later.
