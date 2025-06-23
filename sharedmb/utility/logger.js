const path = require("path");
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

const logsDir = path.resolve(__dirname, "../../logs");

// Transport for info logs
const transportInfo = new DailyRotateFile({
    filename: path.join(logsDir, "admin_access-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "28d",
    json: false,
    level: "info",
});

// Transport for error logs
const transportError = new DailyRotateFile({
    filename: path.join(logsDir, "admin_error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "28d",
    json: false,
    level: "error",
});

// Info Logger
const infoLogger = winston.createLogger({
    level: "info",
    format: logFormat,
    transports: [
        transportInfo,
        new winston.transports.Console({ level: "info" }),
    ],
});

// Error Logger
const errorLogger = winston.createLogger({
    level: "error",
    format: logFormat,
    transports: [
        transportError,
        new winston.transports.Console({ level: "error" }),
    ],
});

module.exports = {
    successlog: infoLogger,
    errorlog: errorLogger,
};