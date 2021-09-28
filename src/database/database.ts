import { Sequelize, ModelCtor } from 'sequelize-typescript';
import logger from '../utils/logger';

export interface DatabaseConnectConfig {
    connectionUrl: string;
}

export class Database {
    db!: Sequelize;

    constructor(protected config: DatabaseConnectConfig) {}

    connect(): void {
        this.db = new Sequelize(this.config.connectionUrl);
    }

    async initModels(models: ModelCtor[] = []): Promise<void> {
        if (!this.db) {
            throw new Error('Connect to a database must be established');
        }
        this.db.addModels(models);

        for (const model of models) {
            logger.info(`Try to initialize ${model.tableName}`);
            await model.sync({
                alter: true,
            });
        }
    }
}
