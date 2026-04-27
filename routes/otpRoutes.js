import express from "express";
import twilio from "twilio";
import { sendEmail } from "../config/emailService.js";
import authMiddleware from "../middleware/userAuth.js";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

const router = express.Router();

// Twilio config
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📤 SEND OTP
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;
    const { userId } = req.user;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Find the user in DB
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();
    const otpExpireAt = Date.now() + 5 * 60 * 1000; // 5 min validity

    // Save OTP to user
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = otpExpireAt;
    await user.save();

    // (Optional) Send SMS via Twilio (disabled for trial accounts)
    /*
    await client.messages.create({
      body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone, // must be in +countryCode format
    });
    */

    // Send Email
    // const mailOption = {
    //   from: process.env.SENDER_EMAIL,
    //   to: user.email,
    //   subject: "Prime Blocks - OTP Verification",
    //   text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
    //       <h2 style="color: #0d6efd; text-align: center; margin-bottom: 10px;">Prime Blocks</h2>
    //       <p style="color: #333; font-size: 15px; text-align: center;">Your one-time password (OTP) is:</p>
    //       <div style="text-align: center; margin: 20px 0;">
    //         <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #0d6efd; padding: 10px 24px; border-radius: 6px; letter-spacing: 2px;">
    //           ${otp}
    //         </span>
    //       </div>
    //       <p style="color: #555; font-size: 14px; text-align: center; margin-top: 10px;">
    //         This OTP will expire in 5 minutes.<br />
    //         Please do not share it with anyone.
    //       </p>
    //       <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
    //         © ${new Date().getFullYear()} Prime Blocks
    //       </p>
    //     </div>
    //   `,
    // };
     await sendEmail(
      user.email,
      "Your OTP Code",
      `Your verification code is ${otp}`,
      `<h2>Your OTP Code</h2><p><b>${otp}</b> is your verification code. It will expire in 5 minutes.</p>`
    );

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

export default router;
