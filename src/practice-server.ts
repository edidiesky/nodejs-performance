import express from "express";
import os from "os";
import { Worker } from "worker_threads";
import dotenv from "dotenv";
import logger from "./utils/logger";
import path from "path";
import { generateBlockingCode } from "./utils/generateBlockingCode";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

// health route
app.use("/health", (req, res) => {
  res.status(200).json({
    message: "The server is quite healthy!!!",
  });
});

// blocking route
app.use("/blocking", (req, res) => {
  const result = generateBlockingCode(40000);
  res.status(200).json({
    message: "The blocking route result has been calculated!",
    result,
  });
});

// non blocking route
app.use("/blocking", (req, res) => {
  const workerpath = path.resolve(__dirname, "./workers/practice-worker.js");
  const worker = new Worker(workerpath, { workerData: { rows: 10000 } });
  worker.on("message", (data) => {
    res.status(200).json({
      message: "The non blocking route result has been calculated!",
      data,
    });
  });
  worker.on("error", (error) => {
    res.status(200).json({
      error,
    });
  });
});

app.listen(PORT, () => {
  logger.info(`App is running on http://localhost:${PORT}`);
});
