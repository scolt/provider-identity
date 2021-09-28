import { Table, Column, Model, DataType, PrimaryKey, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';
import { Adapter } from './adapter.model';

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
    @ForeignKey(() => Adapter)
    @Column(DataType.UUID)
    adapterId: string;

    @BelongsTo(() => User, { onDelete: 'cascade' })
    user: User;

    @BelongsTo(() => Adapter, { onDelete: 'cascade' })
    adapter: Adapter;
}
