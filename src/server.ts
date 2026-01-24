import express from "express";
import logger from "./utils/logger";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: [process.env.WEB_ORIGIN!],
    credentials: true,
  }),
);

// expensinve function
function expensiveFunction(duration:number) {
    const start = Date.now();
    while(Date.now() - start < duration) {
    }
}


app.get('/', (req, res)=> {
    expensiveFunction(10000)
    res.send("The application is running fine!")
})

app.listen(3000, () => {
  logger.info("Server is listening on port 3000");
});
