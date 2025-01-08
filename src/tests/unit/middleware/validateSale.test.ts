import { createRequest, createResponse } from "node-mocks-http"
import { hasAccess, validateSaleExists } from "../../../middlewares/validateSale"
import Sale from "../../../models/Sale.model"
import { sales } from "../../mocks/sales"
import { Result } from "express-validator"

jest.mock('../../../models/Sale.model', () => ({
    findByPk: jest.fn(), //creamos la funcion findByPk
}))

describe('validateSale - validateSaleExist', () => {
    test('should handle non-existing sale', async () => {

        (Sale.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'GET',
            params: { saleId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateSaleExists(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toStrictEqual({
            error: 'Venta no encontrada'
        })
        expect(next).not.toHaveBeenCalled()
    })
    test('should handle existing sale[0]', async () => {

        (Sale.findByPk as jest.Mock).mockResolvedValue(sales[0])

        const req = createRequest({
            method: 'GET',
            params: { saleId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateSaleExists(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.sale).toEqual(sales[0])// esperamos que lo que se agregue ese midleware sea sale[0]
    })
    test('should get a error', async () => {

        //mandamos llamar el finByPk con una excepcion para que en cuanto s ejecute provocar un error y mandarlo al try catch
        (Sale.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'GET',
            params: { saleId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateSaleExists(req, res, next)
        const data = res._getJSONData() // es para obtener el resultado de res.json

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({
            error: 'Hubo un error'
        })


    })
})

describe('validateSale - hasAccess', () => {
    test('should retrun 401 error id userId does not have access to sales ', async () => {

        //  (Sale.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
           sale:sales[0],// sale: { userId: 1 },
            user: { id: 2 }
        })
        const res = createResponse()
        const next = jest.fn()

        await hasAccess(req, res, next)
        const data = res._getJSONData()
        
        expect(res.statusCode).toBe(401)
        expect(data).toEqual({
            error: 'No tienes acceso a esta venta'
        })
        expect(next).not.toHaveBeenCalled()
    })
    test('should has access sale.userId = 1 and user.id = 1', async () => {

        //  (Sale.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            sale:sales[0],//sale: { userId: 1 },
            user: { id: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await hasAccess(req, res, next)
       
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1)

    })

})