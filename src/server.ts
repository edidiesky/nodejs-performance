import os from "os";
import express from "express";
import cluster from "cluster";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const NUM_WORKERS = process.env.NUM_WORKERS
  ? parseInt(process.env.NUM_WORKERS)
  : os.cpus()?.length;

app.use(
  cors({
    origin: [process.env.WEB_ORIGIN!],
    credentials: true,
  }),
);

// expensive function
if (cluster.isPrimary) {
  for (let i = 0; i < NUM_WORKERS; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  function expensiveFunction(duration: number) {
    const start = Date.now();
    while (Date.now() - start < duration) {}
  }

  app.get("/", (req, res) => {
    expensiveFunction(10000);
    res.send(`Worker ${process.pid} completed request`);
  });

  app.get("/fast", (req, res) => {
     res.send(`Fast response from ${process.pid}`);
  });

  const PORT = process.env.PORT || 3000;
  app.listen(3000, () => {
     logger.info(`Worker ${process.pid} on port ${PORT}`);
  });
}
