import {
    ModelAttributes,
    ModelCtor,
} from 'sequelize';

export interface ModelConfig {
    tableName: string;
    model: ModelCtor<any>;
    attributes: ModelAttributes;
}
