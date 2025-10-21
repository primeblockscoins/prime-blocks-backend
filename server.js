import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from 'cookie-parser';
import cryptoRouter from "./routes/cryptoRoutes.js";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import kycRoutes from "./routes/kycRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import otpRouter from "./routes/otpRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

connectDB();

app.use("/api/crypto", cryptoRouter);
app.use("/api/auth", authRouter);
app.use("/api/kyc", kycRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/otp", otpRouter);

app.get('/', (req, res) => res.send("Api Working"));

app.listen(PORT, () => {
    console.log("Server started at http://localhost:" + PORT);
});
