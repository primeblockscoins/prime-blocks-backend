import fetch from "node-fetch";
import Crypto from "../models/cryptoModel.js";

const COIN_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

// Fetch crypto data and save in MongoDB
export async function fetchCryptoData() {
  try {
    const res = await fetch(COIN_API_URL);
    if (!res.ok) {
      console.error("CoinGecko API returned error:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error("CoinGecko returned non-array data:", data);
      return;
    }

    // Clear old cache and save new data
    await Crypto.deleteMany({});
    const coins = data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      price_change_24h: coin.price_change_percentage_24h,
      last_updated: coin.last_updated,
    }));

    await Crypto.insertMany(coins);
    console.log("Crypto data updated in MongoDB at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("Error fetching crypto data:", err);
  }
}

// Express route to serve cached data from MongoDB
export const getCryptoData = async (req, res) => {
  try {
    const coins = await Crypto.find().sort({ market_cap: -1 });
    res.json(coins);
  } catch (err) {
    console.error("Error fetching from DB:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Auto-refresh every 20s
fetchCryptoData();
setInterval(fetchCryptoData, 20000);
