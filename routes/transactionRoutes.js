import express from "express";
import authMiddleware from "../middleware/userAuth.js";
import transactionModel from "../models/transactionModel.js";
import userModel from "../models/userModel.js";

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const {
      transferType,   // "crypto" or "bank"
      walletType,     // e.g., "BTC", "ETH" (only for crypto)
      walletAddress,  // only for crypto
      name,
      accNo,          // only for bank
      IFSC,           // only for bank
      amount,
      panNumber,
      email,
      phoneNumber,
    } = req.body;
    const { userId } = req.user;

    // ✅ Basic validation
    if (!transferType || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await userModel.findById(userId);

    // if(otp != user.verifyOtp){
    //   return res.status(400).json({ success: false, message: "Invalid OTP" });
    // }

    // if (user.verifyOtpExpireAt < Date.now()) {
    //   return res.status(400).json({ success: false, message: 'OTP Expired' });
    // }

    if(email != user.email){
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    // ✅ Initialize data common for both
    const transactionData = {
      userId: req.user.userId,
      transferType,
      amount,
      email,
      phoneNumber,
      transactionStatus: "pending",
    };

    // ✅ Add conditional fields
    if (transferType === "crypto") {
      if (!walletType || !walletAddress) {
        return res
          .status(400)
          .json({ success: false, message: "Wallet type and address are required for crypto transfers" });
      }
      transactionData.walletType = walletType;
      transactionData.walletAddress = walletAddress;
    } else if (transferType === "bank") {
      if (!name || !accNo || !IFSC) {
        return res
          .status(400)
          .json({ success: false, message: "Name, account number and IFSC are required for bank transfers" });
      }
      transactionData.accNo = accNo;
      transactionData.IFSC = IFSC;
      transactionData.name = name;
      transactionData.panNumber = panNumber;
    } else {
      return res.status(400).json({ success: false, message: "Invalid transfer type" });
    }

    // ✅ Save transaction
    const transaction = new transactionModel(transactionData);
    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
