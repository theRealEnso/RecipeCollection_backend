//read winston documentation for configuration settings

import winston from "winston";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const syslogColors = {
    debug: "rainbow",
    info: "red",
    notice: "white",
    warning: "yellow",
    error: "bold red",
    crit: "inverse yellow",
    alert: "bold inverse red",
    emerg: "bold inverse magenta",
  };

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    process.env.NODE_ENV === "development" ? winston.format.colorize({all: true, colors: syslogColors}) : winston.format.uncolorize(),
    winston.format.align(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`),
    enumerateErrorFormat(),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
  levels: winston.config.syslog.levels
});

export default logger;

// To be used as logger.info(message) or logger.error(error)