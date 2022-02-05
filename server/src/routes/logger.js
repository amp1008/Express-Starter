"use strict";

const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");

const filePath = path.join(global.BASE_PATH, "logs/");

const transport = new winston.transports.DailyRotateFile({
    filename: filePath + "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    json: false,
    maxSize: "20m",
    maxFiles: "14d",
});

const logger = winston.createLogger({
    transports: [transport],
});

function logError(message) {
    let details = message.details;
    let errorMsg;
    try {
        if (details instanceof Error) {
            errorMsg = details.message;
        } else if (typeof details === "object") {
            errorMsg = JSON.stringify(details);
        } else {
            errorMsg = details;
        }
    } catch (error) {
        errorMsg = details;
    }
    message.details = errorMsg;
    logger.log("error", JSON.stringify(message));
}

module.exports = {
    logError,
};
