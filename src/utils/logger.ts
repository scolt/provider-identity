import { format, createLogger, transports } from 'winston';

const logFormat = format.printf(info => {
    const date = new Date().toISOString();
    return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}`;
});

const logger = createLogger({
    level: 'debug',
    format: format.json(),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), logFormat),
        }),
    ],
});

export default logger;
