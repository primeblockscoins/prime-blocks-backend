import fetch from "node-fetch";

async function fetchCryptoData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
    );
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected API response:", data);
      return [];
    }

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
    console.error("Error fetching data:", err);
    return [];
  }
}

let cache = [];
async function refreshData() {
  cache = await fetchCryptoData();
  console.log("Data updated at", new Date().toLocaleTimeString());
}

setInterval(refreshData, 20000); // refresh every 20s
refreshData();

export const getCryptoData = (req, res) => {
  res.json(cache);
};
