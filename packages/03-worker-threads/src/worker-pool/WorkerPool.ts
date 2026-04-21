import { Worker } from "worker_threads";
import { EventEmitter } from "events";
import { IPoolStats, IWorker } from "./types";
export class WorkerPool extends EventEmitter {
  private destroying = false;
  // total queue
  private workers: Worker[] = [];
  // fee queue
  private freeWorkers: Worker[] = [];
  // busy queue
  // queueed queuse
  private queue: IWorker[] = [];

  private workerTaskMap = new Map<Worker, IWorker>();
  constructor(
    private readonly workerPath: string,
    private readonly poolSize: number,
  ) {
    super(); // called to make use of event emiyter attr so it can be reselected in "this" keyword.
  }

  private addWorkers(): void {
    /**
     * add workers on event: message
     * delete dead worker on event: error
     * exit w
     */
    const worker = new Worker(this.workerPath);
    worker.on("message", (data) => {
      const task = this.workerTaskMap.get(worker);
      if (task) {
        this.workerTaskMap.delete(worker);
        task.resolve(data);
      }
      this.processQueue(worker);
    });

    /**
     * get the worker
     * if it exists, dleete the worker so we will not have stale workers if the resolve of reject action fails
     * remobce the dead worker, since the os thread is dead, so the the run() will not pop up a dead worker.
     * this.addWorker() is meant to add a new worker.
     */
    worker.on("error", (err) => {
      const task = this.workerTaskMap.get(worker);
      if (task) {
        this.workerTaskMap.delete(worker);
        task.reject(err);
      }
      this.workers = this.workers.filter((x) => x !== worker);
      this.addWorkers();
    });

    worker.on("exit", (code: number) => {
      if (!this.destroying && code !== 0) {
        this.emit("worker:exit", { code, workerPath: this.workerPath });
      }
    });
    this.workers.push(worker);
    this.freeWorkers.push(worker);
  }

  private processQueue(worker: Worker): void {
    if (this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.runTask(worker, task);
    } else {
      this.freeWorkers.push(worker);
      if (this.workerTaskMap.size === 0) {
        this.emit("drain");
      }
    }
  }

  async destroy(): Promise<void> {
    this.destroying = true;
    await Promise.all(this.workers.map((w) => w.terminate()));
    this.workers = [];
    this.freeWorkers = [];
    this.queue = [];
    this.workerTaskMap.clear();
  }

  private runTask(worker: Worker, task: IWorker) {
    this.workerTaskMap.set(worker, task);
    worker.postMessage(task.data);
  }

  stats(): IPoolStats {
    return {
      total: this.workers.length,
      free: this.freeWorkers.length,
      busy: this.workerTaskMap.size,
      queued: this.queue.length,
    };
  }

  /**
   *
   * 1.
   */
  run(data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const task: IWorker = { data, resolve, reject };
      if (this.freeWorkers.length > 0) {
        const worker = this.freeWorkers.pop()!;
        this.runTask(worker, task);
      } else {
        this.queue.push(task);
      }
    });
  }

  init(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.addWorkers();
    }
  }

  // add worker
}
