import { parentPort, workerData } from "worker_threads";

if (!parentPort) {
  throw new Error("This module must be run as a worker thread");
}

function cpuBoundTask(input: number): number {
  let result = 0;
  for (let i = 0; i < input; i++) {
    result += Math.sqrt(i);
  }
  return result;
}

parentPort.on("message", (data: unknown) => {
  try {
    const input = data as number;
    const result = cpuBoundTask(input);
    parentPort!.postMessage({ success: true, result });
  } catch (err) {
    parentPort!.postMessage({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});