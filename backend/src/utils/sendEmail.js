import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "CivicEye Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>CivicEye Email Verification</h2>

        <p>Your verification OTP is:</p>

        <h1 style="letter-spacing: 4px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for a short time only.
        </p>
      </div>
    `,
  });
};
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);