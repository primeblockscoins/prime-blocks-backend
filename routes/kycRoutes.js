import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/userAuth.js";
import supabase from "../config/supabaseClient.js";
import kycModel from "../models/kycModel.js";

const router = express.Router();

// upload.fields() allows multiple file inputs
router.post(
  "/submit",
  authMiddleware,
  upload.fields([
    { name: "passportFront", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { fullName, dateOfBirth, passportNumber } = req.body;
      const { userId } = req.user; // from your middleware

      // 1️⃣ Upload each file to Supabase Storage
      const uploadToSupabase = async (file, folder) => {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from("prime blocks docs") // your bucket name
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) throw error;

        // Get public/signed URL (you can use getPublicUrl or createSignedUrl)
        const { data: urlData } = supabase.storage.from("kyc-files").getPublicUrl(fileName);
        return urlData.publicUrl;
      };

      const passportFrontUrl = await uploadToSupabase(req.files.passportFront[0], "passport");
      const photoUrl = await uploadToSupabase(req.files.photo[0], "photo");
      const signatureUrl = await uploadToSupabase(req.files.signature[0], "signature");

      // 2️⃣ Save to MongoDB
      const kyc = new kycModel({
        userId,
        fullName,
        dateOfBirth,
        passportNumber,
        passportFrontUrl,
        photoUrl,
        signatureUrl,
      });

      await kyc.save();

      res.status(201).json({ success: true, message: "KYC submitted successfully", data: kyc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
