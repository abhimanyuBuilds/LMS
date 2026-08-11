import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";



const paymentLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),


    transports: [
        new DailyRotateFile({
            filename: "Paymentlogs/logs/payment-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxFiles: "30d",
            zippedArchive: false
        })
    ]

});



export const logPayments = ({
    userId,
    courseId,
    orderId,
    paymentId,
    amount,
    currency,
    status,
    failureReason


}) => {
    paymentLogger.info({
        event: "PAYMENT",


        userId,
        courseId,
        orderId,
        paymentId,
        amount,
        currency,
        status,
        failureReason

    });
};