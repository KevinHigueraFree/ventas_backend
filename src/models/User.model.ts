
import { Table, Column, Model, DataType, Default, Unique, AllowNull, HasMany } from 'sequelize-typescript'
import Sale from './Sale.model'

@Table({
    tableName: 'user'
})

class User extends Model {


    @AllowNull(false)//nno puede ser ulo
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string // para poder usar el declare tuvimos que habilitar usardecorator en tsconfig.json


    @AllowNull(false)
    @Column({
        type: DataType.STRING(60)
    })
    declare password: string



    @AllowNull(false)
    @Unique(true)  //hace que el el email sea unico
    @Column({
        type: DataType.STRING(50)
    })
    declare email: string


    @Column({
        type: DataType.STRING(6)
    })
    declare token: string

    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    declare confirmed: boolean


    @HasMany(() => Sale, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    })
    declare sale: Sale[]

}


export default User




