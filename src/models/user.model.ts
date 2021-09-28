import crypto from 'crypto';
import {
    Table,
    Column,
    Model,
    HasMany,
    DataType,
    IsUUID,
    PrimaryKey,
    IsDate,
    Default,
    BeforeCreate,
} from 'sequelize-typescript';
import { config } from '../config';
import { UserNetwork } from './network.model';
import { UserAdapter } from './user.adapter.model';

@Table({
    timestamps: true,
    tableName: 'users',
})
export class User extends Model {
    @IsUUID(4)
    @Default(DataType.UUIDV4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: string;

    @Column(DataType.STRING)
    password: string;

    @Column(DataType.STRING)
    salt: string;

    @Column(DataType.STRING)
    firstName: string;

    @Column(DataType.STRING)
    lastName: string;

    @Column(DataType.STRING)
    email: string;

    @IsDate
    @Column(DataType.DATE)
    lastLoggedInDate: Date;

    @HasMany(() => UserNetwork)
    networks: UserNetwork[];

    @HasMany(() => UserAdapter)
    adapters: UserAdapter[];

    @Column(DataType.BOOLEAN)
    active: boolean;

    @BeforeCreate
    static beforeCreateHook(instance: User): void {
        if (instance.password) {
            instance.salt = crypto.randomBytes(256).toString('hex').substr(0, 16);
            instance.password = User.encryptPasswordWithSalt(instance.password, instance.salt);
        }
    }

    static encryptPasswordWithSalt(password: string, salt: string): string {
        const key = crypto.createHash('sha256').update(config.passwordSecret).digest('base64').substr(0, 32);

        const cipher = crypto.createCipheriv('aes-256-ctr', key, salt);
        let crypted = cipher.update(password + salt, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    static isPasswordValid(instance: User, password: string): boolean {
        return User.encryptPasswordWithSalt(password, instance.salt) === instance.password;
    }
}
