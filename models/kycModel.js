import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Links to userModel
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String, // or Date if you prefer
        required: true
    },
    passportNumber: {
        type: String,
        required: true,
        unique: true
    },
    passportFrontUrl: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    signatureUrl: {
        type: String,
        required: true
    },
    kycStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

const kycModel = mongoose.models.kyc || mongoose.model("kyc", kycSchema);

export default kycModel;