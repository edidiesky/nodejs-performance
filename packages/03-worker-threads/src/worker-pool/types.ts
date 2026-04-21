
export interface IWorker {
    data:unknown;
    resolve: (result:unknown)=> void;
    reject: (error:Error)=> void;
}

export interface IPoolStats {
    total:number;
    free:number;
    busy:number;
    queued:number;
}