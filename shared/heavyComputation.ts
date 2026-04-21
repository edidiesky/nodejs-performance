function heavyComputation(iteraton:number = 1) {
    let res = 0;

    for(let i=0; i < 10000 * iteraton; i++) {
        res += Math.sqrt(i)
    }

    return res;
}

export default heavyComputation