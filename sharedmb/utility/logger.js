const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Transport for info logs
const transportInfo = new DailyRotateFile({
    filename: "../logs/admin_access.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "28d",
    json: false,
    prepend: true,
    level: "info",
});

// Transport for error logs
const transportError = new DailyRotateFile({
    filename: "../logs/admin_error.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "28d",
    json: false,
    prepend: true,
    level: "error",
});

// Create separate loggers for info and error
const infoLogger = winston.createLogger({
    format: logFormat,
    transports: [
        transportInfo,
        new winston.transports.Console({
            level: "info",
        }),
    ],
});

const errorLogger = winston.createLogger({
    format: logFormat,
    transports: [
        transportError,
        new winston.transports.Console({
            level: "error",
        }),
    ],
});

module.exports = {
    successlog: infoLogger,
    errorlog: errorLogger,
};
