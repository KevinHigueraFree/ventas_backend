import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Sale from "../models/Sale.model"

// declaramos una variable en express 
declare global {
    namespace Express {
        interface Request {
            sale?: Sale // lo hacemos opcional con ?
        }
    }
}


export const validateSaleInput =
    async (req: Request, res: Response, next: NextFunction) => {

        await body('date')
        // bail() hace que si se cumple la validacion
            .notEmpty().withMessage('Falta la fecha').bail()
            .isDate().withMessage('No es fecha').bail()
            .isISO8601().withMessage('Fecha inválida, debe ser en este formato (YYYY-MM-DD)').bail()
            .toDate()
            .run(req)


        next()


    }

export const validateSaleByID =
    async (req: Request, res: Response, next: NextFunction) => {
        await param('saleId')
            .isInt().withMessage('Id no válido')
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


export const validateSaleExists =
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { saleId } = req.params;
            const sale = await Sale.findByPk(saleId)

            if (!sale) {
                res.status(404).json({
                    error: 'Venta no encontrada'
                })
                return
            }

            req.sale = sale
            next()

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }

    }
export function hasAccess(req: Request, res: Response, next: NextFunction) {
    if (req.sale.userId !== req.user.id) {
        res.status(401).json({ error: 'No tienes acceso a esta venta' })
        return
    }
    next()
}