import {parentPort, workerData} from 'worker_threads'

function heavyComputation(rows: number): number {
  let total = 0;
  for (let i = 0; i < rows * 100000; i++) {
    total += Math.sqrt(i);
  }
  return total;
}

const result = heavyComputation(workerData.rows)

parentPort?.postMessage({result})