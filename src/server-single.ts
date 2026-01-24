import express from "express";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: [process.env.WEB_ORIGIN!],
  credentials: true,
}));

function expensiveFunction(duration: number) {
  const start = Date.now();
  while (Date.now() - start < duration) {}
}

app.get("/", (req, res) => {
  expensiveFunction(10000);
  res.send(`Single process ${process.pid} completed`);
});

app.get("/fast", (req, res) => {
  res.send("Fast response");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Single process ${process.pid} on port ${PORT}`);
});