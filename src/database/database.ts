import { Sequelize } from 'sequelize';
import { ModelConfig } from './model-config.interface';
import logger from '../utils/logger';

export interface DatabaseConnectConfig {
    connectionUrl: string;
}

export class Database {
    db!: Sequelize;

    constructor(protected config: DatabaseConnectConfig) {}

    connect() {
        this.db = new Sequelize(this.config.connectionUrl);
    }

    async initModels(models: ModelConfig[] = []): Promise<void> {
        if (!this.db) {
            throw new Error('Connect to a database must be established');
        }

        for (const config of models) {
            logger.info(`Try to initialize ${config.tableName}`);
            config.model.init(config.attributes, {
                tableName: config.tableName,
                sequelize: this.db,
            });
            await config.model.sync();
        }
    }
}
