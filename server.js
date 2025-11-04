import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

let lastBalance = "0";
let lastFetch = 0;
const FIO_TOKEN = "TVUJ_TOKEN"; // vlož svůj Fio API token

async function fetchFioApi() {
  const now = Date.now();
  if (now - lastFetch < 120000) return lastBalance;
  lastFetch = now;

  try {
    const response = await fetch(`https://fioapi.fio.cz/v1/rest/last/${FIO_TOKEN}/transactions.json`);
    const data = await response.json();

    if (data?.accountStatement?.info) {
      lastBalance = data.accountStatement.info.closingBalance || "0";
      console.log(`✅ Načten zůstatek: ${lastBalance} Kč`);
    }
  } catch (err) {
    console.error("❌ Chyba při načítání Fio API:", err);
  }

  return lastBalance;
}

app.get("/fio", async (req, res) => {
  const balance = await fetchFioApi();
  res.json({ balance });
});

app.get("/", (req, res) => res.send("💛 Fio proxy běží. Endpoint: /fio"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy běží na portu ${PORT}`));
