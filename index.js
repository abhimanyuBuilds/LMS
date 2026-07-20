import express from "express"
import dotenv from "dotenv"
dotenv.config()
import logger from "./logger.js"
import morgan from "morgan"

const app = express()

const morganFormat = ":method :url :status :response-time ms";



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



