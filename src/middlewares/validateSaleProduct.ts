import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Sale from "../models/Sale.model"
import { json, Model } from "sequelize"
import { Where } from "sequelize/lib/utils"
import SaleProduct from "../models/SaleProduct.model"
import Product from "../models/Product.model"

// declaramos una variable en express 
declare global {
    namespace Express {
        interface Request {
            saleProduct?: SaleProduct // lo hacemos opcional con ?
        }
    }
}

export const validateSaleProductInput =
    async (req: Request, res: Response, next: NextFunction) => {

        await body('productId')
            .notEmpty().withMessage('Falta el producto')
            .run(req)
        await body('quantity')
            .notEmpty().withMessage('Falta la cantidad')
            .isNumeric().withMessage('Cantidad inválida')
            .custom(value => value > 0 && value < 101).withMessage('Cantidad debe ser mayor a 0 y menor a 101')
            .run(req)

        next()

    }

export const validateSaleProductByID =
    async (req: Request, res: Response, next: NextFunction) => {
        await param('saleProductId')
            .isInt().withMessage('Id de venta de el producto no válido')
            .custom(value => value > 0).withMessage('El id debe ser mayor a 0')
            .run(req)

        let result = validationResult(req)
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array()

            })
        }

        next()
    }


export const validateSaleProductExists =
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { saleProductId } = req.params;
            const saleProduct = await SaleProduct.findByPk(saleProductId,{
                include: [Product]
            })
            if (!saleProduct) {
                res.status(404).json({
                    error: 'Venta de producto no encontrada'
                })
                return
            }

            req.saleProduct = saleProduct
            next()

        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }

    }
export const validateSaleProductIsSale =
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { saleId, saleProductId } = req.params;
            const saleProduct = await SaleProduct.findOne(
                {
                    where: {
                        id: saleProductId,
                        saleId: saleId
                    }
                }
            );

            if (!saleProduct) {
                res.status(404).json({
                    error: 'Esta venta de producto no pertenece a la venta'
                })
                return
            }

            req.saleProduct = saleProduct

            next()

        } catch (error) {
           res.status(500).json({error:'Hubo un error'})
        }

    }