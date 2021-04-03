import { Table, Column, Model, HasMany, DataType, IsUUID, PrimaryKey, IsDate, Default } from 'sequelize-typescript';
import { UserNetwork } from './network.model';

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

    @Column(DataType.BOOLEAN)
    active: boolean;
}
