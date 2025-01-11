import { NextFunction, Request, Response } from "express";

import Sale from "../models/Sale.model";
import { json } from "sequelize";
import SaleProduct from "../models/SaleProduct.model";



export class saleController {
    static getAll = async (req: Request, res: Response) => {


        try {
            const sales = await Sale.findAll({
                order: [
                    ['id', 'DESC']
                ],
                where: {
                    userId: req.user.id // solo traerá los pertenecientes al user id
                },
                attributes: { exclude: ['createdAt', 'updatedAt'] }
            })
            
            res.json({ data: sales })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Hubo un error" })
        }


    }

    static getById = async (req: Request, res: Response) => {
        //  const saleId = parseInt(req.params.saleId)
        const sale = await Sale.findByPk(req.sale.id, {
            include: [SaleProduct]
        }
        )

        res.json(sale)
    }

    static create =
        async (req: Request, res: Response): Promise<void> => {

            //  res.json(req.body)
            try {
                const sale = await Sale.create(req.body)
                sale.userId = req.user.id
                const saleSaved= await sale.save()
                console.log(saleSaved)
                res.status(201).json({message:'Venta creada correctamente',sale:saleSaved})

            } catch (error) {

                res.status(500).json({ error: "Hubo un error" })
            }
        }

    static update =

        async (req: Request, res: Response) => {

            // usamos req.sale because we are using it internamente
            await req.sale.update(req.body);
            res.json('Venta actualizada')

        }

    static delete =

        async (req: Request, res: Response) => {

            await req.sale.destroy()
            res.json('Venta eliminada')
        }
}

