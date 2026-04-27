import express from "express";
import { getCryptoData } from "../controllers/cryptoController.js";

const cryptoRouter = express.Router();

cryptoRouter.get("/data", getCryptoData);


export default cryptoRouter;