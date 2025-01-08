import express from 'express';
import productRouter from './routes/productRouter';
import saleRouter from './routes/saleRouter';
import authRouter from './routes/authRouter';
import db from './config/db';

import morgan from 'morgan';
import { limiter } from './config/limiter';


export async function connectDB() {
    try {
        await db.authenticate() //esperar a autenticar a la base de datos
        db.sync() // sincronizar la base de datos( en caso de agregar nuevas columnas la ira agregando a la base de datos)
        console.log('se conecto correctamente');
    } catch (error) {
        console.log('Error al conectar en la base de datos');
    }
}

connectDB()


const server = express()

// permite leer datos de los formularios o de el body(e postman)
server.use(express.json())

server.use(morgan('dev'))

//!routing
// el server.use es llamado cuando se hace una peticion desde la url para luego entrar al router
server.use('/api/product', productRouter)
server.use('/api/sale', saleRouter)
server.use('/api/auth', authRouter)

server.get('/',(req, res)=>{
    res.send('Buen ritmo')
})



//req es lo que se envia,


export default server;
