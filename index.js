import express from "express"
import dotenv from "dotenv"
import logger from "./services/logger.js"
import morgan from "morgan"
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./database/db.js"
import UserRoute from "./routes/user.route.js"
import {apiLimiter} from "./middlewares/Auth.rateLimmter.middleware.js"
dotenv.config()

const app = express()
const PORT = process.env.PORT

// Body Parser Middleware
app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/api" , apiLimiter)


const morganFormat = ":method :url :status :response-time ms";

await connectDB()
app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const [method, url, status, responseTime] = message.trim().split(" ");
                logger.info(JSON.stringify({
                    method,
                    url,
                    status,
                    responseTime
                }
                )
                )
            },
        },
    },
    )
);


app.use("/api/v1/user", UserRoute)



// handler 404 

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    })
});


app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`
    )
})