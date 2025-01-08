import { Request, Response } from "express";

import User from "../models/User.model";
import Sale from "../models/Sale.model";
import SaleProduct from "../models/SaleProduct.model";
import Product from "../models/Product.model";


export class saleProductController {
    static getAll = async (req: Request, res: Response) => {

        const saleId = req.params.saleId; // suponiendo que el ID del Usere se pasa como parámetro en la ruta

        const salesProducts = await SaleProduct.findAll({

            where: {
                saleId: saleId
            },
            order: [
                ['id', 'DESC']
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] },

            include: [
                {
                    model: Product,
                    as: 'product', // Asegúrate de que este alias coincida con lo que definiste en tu modelo Product
                    attributes: { exclude: ['createdAt', 'updatedAt'] } // Excluyendo atributos innecesarios
                }
            ]

        });

        res.json({
            salesProducts
        })

    }

    static getById = async (req: Request, res: Response) => {
   
    res.json(req.saleProduct)

    }

    static create =
        async (req: Request, res: Response): Promise<void> => {

            try {
       
                const saleProduct = await SaleProduct.create(req.body)
                const product = req.product
                
                saleProduct.saleId = req.sale.id;
                saleProduct.subtotal = product.price;
                saleProduct.total = saleProduct.subtotal * saleProduct.quantity
               

                await saleProduct.save();
                res.status(201).json('Venta de producto creada')

            } catch (error) {
             
                res.status(500).json({ error: "Hubo un error" })
            }

        }

    static update =

        async (req: Request, res: Response) => {

            // usamos req.user because we are using it internamente
            await req.saleProduct.update(req.body);
            res.json('Venta de producto actualizada')

        }

    static delete =

        async (req: Request, res: Response) => {

            await req.saleProduct.destroy()
            res.json('Venta de producto eliminada')
        }
}