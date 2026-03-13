import { generateBlockingCode } from "../utils/generateBlockingCode";
import { parentPort } from "worker_threads";

parentPort?.on("message", (data) => {
  console.log(`[Worker ${process.pid}] received the tasks:`, { data });
  const result = generateBlockingCode(data.rows);
  console.log(`[Worker ${process.pid}] sending result back`);
  parentPort?.postMessage({ result });
});
