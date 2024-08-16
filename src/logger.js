const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize } = format;

// custom format for logger to make prettier
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// logger initialization
const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Add colors
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
    }),
    // destination of the logs
    new transports.File({ filename: "./src/logs/errors.log" }),
  ],
});

module.exports = logger;
