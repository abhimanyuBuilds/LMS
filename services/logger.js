import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, json, colorize } = format;

// custom format for console logging with color

const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp}: ${level}: ${message}`;
    })
);




// rotate logger daily

const transportResponses = new DailyRotateFile({
    filename: "app-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH-mm",
    zippedArchive: false,
    maxSize: "1mb",
    maxFiles: "1"
})



// create a winston logger 

const Logger = createLogger({
    level: 'info',
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new transports.Console({
            format: consoleLogFormat,
        }),
        transportResponses
    ]
})




export default Logger