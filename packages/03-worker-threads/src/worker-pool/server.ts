import http from "http";
import path from "path";
import os from "os";
import { WorkerPool } from "./WorkerPool";

const PORT = 3000;
const workerPath = path.resolve(__dirname, "worker.js");
const pool = new WorkerPool(workerPath, os.cpus().length);

pool.init();

const server = http.createServer(async (req, res) => {
  if (req.url === "/compute" && req.method === "GET") {
    try {
      const result = await pool.run(1_000_000);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: "computation failed" }));
    }
    return;
  }

  // blocking version, no worker pool, runs on main thread
  if (req.url === "/compute-blocking" && req.method === "GET") {
    let result = 0;
    for (let i = 0; i < 1_000_000; i++) {
      result += Math.sqrt(i);
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, result }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
  console.log(`pool stats:`, pool.stats());
});

process.on("SIGTERM", async () => {
  server.close();
  await pool.destroy();
  process.exit(0);
});
