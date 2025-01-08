
import { Column, Model, DataType, ForeignKey, BelongsTo, Table } from 'sequelize-typescript';
import Sale from './Sale.model';
import Product from './Product.model';

@Table({
    tableName: 'sale_product'
})

class SaleProduct extends Model {

    @Column({
        type: DataType.INTEGER
    })
    declare quantity: number

    @Column({
        type: DataType.FLOAT(5)
    })
    declare subtotal: number
    
    @Column({
        type: DataType.FLOAT(5)
    })
    declare total: number

    @ForeignKey(() => Sale)
    @Column
    declare saleId: number;

    @BelongsTo(() => Sale)
    declare sale: Sale;

    @ForeignKey(() => Product)
    @Column
    declare productId: number;

    @BelongsTo(() => Product)
    declare product: Product;

}



export default SaleProduct



