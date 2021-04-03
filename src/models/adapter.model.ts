import { Table, Column, Model, DataType, IsUUID, PrimaryKey, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
    timestamps: true,
    tableName: 'users_adapters',
})
export class UserAdapter extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId: string;

    @PrimaryKey
    @Column(DataType.STRING)
    adapterId: string;

    @BelongsTo(() => User)
    user: User;
}
