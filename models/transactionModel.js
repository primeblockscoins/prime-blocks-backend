import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Link to user
        required: true
    },
    transferType: {
        type: String,
        enum: ["crypto", "bank"],
        required: true
    },
    walletType: {
        type: String,
        default: '',
    },
    walletAddress: {
        type: String,
        default: '',
    },
    accNo: {
        type: String,
        default: '',
    },
    IFSC: {
        type: String,
        default: '',
    },
    amount: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: ""
    },
    transactionStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.models.transaction || mongoose.model("transaction", transactionSchema);

export default transactionModel;