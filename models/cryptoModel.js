import mongoose from "mongoose";

const cryptoSchema = new mongoose.Schema({
  id: String,
  name: String,
  symbol: String,
  image: String,
  current_price: Number,
  market_cap: Number,
  total_volume: Number,
  price_change_24h: Number,
  last_updated: Date,
}, { timestamps: true });

// Avoid OverwriteModelError in Render / hot reload
const cryptoModel = mongoose.models.Crypto || mongoose.model("Crypto", cryptoSchema);

export default cryptoModel;
