import express from "express";
import cron from "node-cron";
import { loadDataIntoAo } from "./utils/ao-connect.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send({ info: "unskew.ai" });
});

// Schedule a cron job to run at the start of every hour
cron.schedule("0 * * * *", async () => {
  try {
    await loadDataIntoAo();
  } catch (error) {
    console.error("Error making API call:", error);
  }
});

app.listen(PORT, async() => {
  console.log(`[⚡️] Server running at port: ${PORT}`);
});
