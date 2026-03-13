import { generateBlockingCode } from "../utils/generateBlockingCode";
import { workerData, parentPort } from "worker_threads";

const result = generateBlockingCode(workerData.rows)
parentPort?.postMessage({result})