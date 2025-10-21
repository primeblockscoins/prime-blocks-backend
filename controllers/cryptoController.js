import fetch from "node-fetch";

const COIN_API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

let cache = [];

// Fetch crypto data safely
async function fetchCryptoData() {
  try {
    const res = await fetch(COIN_API_URL);

    if (!res.ok) {
      console.error("CoinGecko API returned error status:", res.status, res.statusText);
      return cache; // keep previous cache
    }

    const data = await res.json();

    // Check if data is actually an array
    if (!Array.isArray(data)) {
      console.error("CoinGecko returned non-array data:", data);
      return cache; // keep previous cache
    }

    // Map only if it's an array
    return data.map((coin) => ({
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
  } catch (err) {
    console.error("Error fetching crypto data:", err);
    return cache; // keep previous cache
  }
}

// Refresh cache safely
async function refreshData() {
  const newData = await fetchCryptoData();
  if (Array.isArray(newData) && newData.length > 0) {
    cache = newData;
    console.log("Crypto data updated at", new Date().toLocaleTimeString());
  } else {
    console.log("Using previous cache, update skipped at", new Date().toLocaleTimeString());
  }
}

// Initial fetch + auto-refresh every 20s
refreshData();
setInterval(refreshData, 20000);

// Express route
export const getCryptoData = (req, res) => {
  res.json(cache);
};
