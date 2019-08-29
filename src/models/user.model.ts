import {
    DataTypes,
    Model,
    ModelAttributes,
} from 'sequelize';
import {
    ModelConfig,
} from '../database/model-config.interface';

export const TABLE_NAME = 'users';

export interface AuthorizedSocialNetworks {
    facebook: string;
    github: string;
    vkontakte: string;
}

export class UserModel extends Model {
    id!: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    sns?: AuthorizedSocialNetworks;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
}

export const userModelAttributes: ModelAttributes =  {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
    },
    lastName: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
    },
    sns: {
        type: DataTypes.TEXT,
        get() {
            // @ts-ignore
            return JSON.parse(this.getDataValue('sns'));
        },
        set(value) {
            // @ts-ignore
            this.setDataValue('sns', JSON.stringify(value));
        },
    },
};

export const modelUserConfig: ModelConfig = {
    tableName: TABLE_NAME,
    model: UserModel,
    attributes: userModelAttributes,
};
