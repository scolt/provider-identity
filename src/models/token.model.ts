import { Table, Column, Model, DataType, PrimaryKey, BelongsTo, ForeignKey, IsDate } from 'sequelize-typescript';
import { User } from './user.model';

@Table({
    timestamps: true,
    tableName: 'users_tokens',
})
export class UserToken extends Model {
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId: string;

    @PrimaryKey
    @Column(DataType.STRING)
    token: string;

    @IsDate
    @Column(DataType.DATE)
    expiresDate: Date;

    @BelongsTo(() => User, { onDelete: 'cascade' })
    user: User;
}
