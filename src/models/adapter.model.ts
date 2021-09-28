import { Table, Column, Model, DataType, PrimaryKey } from 'sequelize-typescript';

@Table({
    timestamps: true,
    tableName: 'adapters',
})
export class Adapter extends Model {
    @PrimaryKey
    @Column(DataType.UUID)
    adapterId: string;

    @Column(DataType.STRING)
    adapterSecret: string;

    @Column(DataType.STRING)
    redirectUrls: string;

    @Column(DataType.STRING)
    adapterName: string;
}
