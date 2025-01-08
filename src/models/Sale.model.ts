
import { Table, Column, Model, DataType, HasMany, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
//import SaleProduct from './SaleProduct.';
import SaleProduct from './SaleProduct.model';
import User from './User.model';


@Table({
    tableName: 'sale'
})

class Sale extends Model {

    @AllowNull(false)  // para permitir que no se pueda dejar el campo vacío
    @Column({
        type: DataType.DATE
    })
    declare date: Date

    @ForeignKey(() => User)
    @Column
    declare userId: number;

    // sale pertenece a cliente
    @BelongsTo(() => User)
    declare client: User;

    @HasMany(() => SaleProduct, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    })
    declare saleProducts: SaleProduct[];

}




export default Sale



