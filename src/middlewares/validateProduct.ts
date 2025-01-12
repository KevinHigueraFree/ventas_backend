import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"

import Product from "../models/Product.model"

// declaramos una variable en express 
declare global {
    namespace Express {
        interface Request {
            product?: Product // lo hacemos opcional con ?
        }
    }
}

export const validateProductByID =
    async (req: Request, res: Response, next: NextFunction) => {

        await param('productId')
            .isInt().withMessage('Id no válido')
            .custom(value => value > 0).withMessage('El id debe ser mayor a 0')
            .run(req)// para que corra el request

        let result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
            return
        }

        next()
    }

export const validateProductInput =
    async (req: Request, res: Response, next: NextFunction) => {
   
        await body('name')
            .notEmpty().withMessage('Falta el nombre')
            .run(req)

        await body('price')
            .notEmpty().withMessage('Falta el precio')
            .isNumeric().withMessage('Precio inválido')
            .custom(value => value > 0).withMessage('Precio debe ser mayor a 0')
            .run(req)

        next()
    }

export const validateProductExists = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { productId } = req.params.productId ? req.params : req.body;
        const product = await Product.findByPk(productId)
        if (!product) {
            res.status(404).json({
                error: 'Producto no encontrado'
            })
            return
        }
        
        req.product = product
        next()

    } catch (error) {
        console.log(error);
    }
}