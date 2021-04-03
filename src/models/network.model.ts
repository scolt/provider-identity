import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
    timestamps: true,
    tableName: 'users_networks',
})
export class UserNetwork extends Model {
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId: string;

    @PrimaryKey
    @Column(DataType.STRING)
    networkInternalId: string;

    @PrimaryKey
    @Column(DataType.STRING)
    networkName: string;

    @BelongsTo(() => User)
    user: User;
}
