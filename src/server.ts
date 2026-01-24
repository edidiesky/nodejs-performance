import express from "express";
import cluster from "cluster";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// logger.info("is cluster master value:", {
//     isMaster: cluster.isPrimary,
// })

app.use(
  cors({
    origin: [process.env.WEB_ORIGIN!],
    credentials: true,
  }),
);

// expensive function
if(cluster.isPrimary) {
    cluster.fork();
    // cluster.fork();
    // cluster.fork();
    // cluster.fork();
    // cluster.fork();
    // cluster.fork();
    // cluster.fork();
    // cluster.fork();
} else {
    function expensiveFunction(duration:number) {
    const start = Date.now();
    while(Date.now() - start < duration) {
    }
}


app.get('/', (req, res)=> {
    expensiveFunction(10000)
    res.send("The application is running fine!")
})

app.get('/fast', (req, res)=> {
    res.send("The application is running fast!")
})


app.listen(3000, () => {
  logger.info("Server is listening on port 3000");
});

}