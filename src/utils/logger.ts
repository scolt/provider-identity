import winston from 'winston';

const logFormat = winston.format.printf((info) => {
    const date = new Date().toISOString();
    return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), logFormat),
        }),
    ],
});

export default logger;
