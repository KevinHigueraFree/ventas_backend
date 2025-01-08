import { Request, Response } from "express";
import Product from "../models/Product.model";


export class productController { 
    static getAll = async (req: Request, res: Response) => {
        const products = await Product.findAll({
            order: [
                ['id', 'DESC']
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        })
        res.json({ data: products })
    }

    static getById = async (req: Request, res: Response) => {
        res.json(req.product)
    }

    static create =
        async (req: Request, res: Response): Promise<void> => {

            try {

                const product = await Product.create(req.body)
                res.status(201).json({ data: product })

            } catch (error) {
                res.status(500).json({ error: "Hubo un error" })
            }
        }

    static update =
        async (req: Request, res: Response) => {

            // usamos req.product because we are using it internamente
            await req.product.update(req.body);
            res.status(200).json('Producto actualizado')

        }

    static updateEnable =
        async (req: Request, res: Response) => {

        
            req.product.enable = !req.product.enable
            await req.product.save();
            res.status(200).json('Disponibilidad actualizada')

        }

    static delete =

        async (req: Request, res: Response) => {

            await req.product.destroy()
            res.status(200).json('Producto eliminado')
        }
}