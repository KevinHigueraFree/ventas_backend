
import { Table, Column, Model, DataType, Default, HasMany, AllowNull } from 'sequelize-typescript';
import SaleProduct from './SaleProduct.model';



@Table({
    tableName: 'product'
})

class Product extends Model {
    @AllowNull(false)  // para permitir que no se pueda dejar el campo vacío
  
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string // declre dice que la variable name ya esta en sequelize y nosotors estamos creando el modelo nomas
    @AllowNull(false)  // para permitir que no se pueda dejar el campo vac
    @Column({
        type: DataType.FLOAT(5)
    })
    declare price: number

    
    @Default(true)// HCAE QUE POR DEFAULT SEA TRUE
    @Column({
        type: DataType.BOOLEAN

    })
    declare enable: boolean

    // un producto tiene muchos presupuesto
    // cascade do is to delete or update the  SaleProduct that is  relationed with the register product
    //restrict : no deja borrarlo mientras otro lo este usando
    // notaction: hace que es similar a restrict
    // set null : si elimino el producto, en saleprosucto la foreyjey toma el valor de null
    // set default:  al eliminar producto la FK tomara un valor por default
    @HasMany(() => SaleProduct,{
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    
    declare saleProducts: SaleProduct[];

}
export default Product
