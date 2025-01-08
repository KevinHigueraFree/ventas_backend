import { createRequest, createResponse } from "node-mocks-http"
import Product from "../../../models/Product.model"
import { validateSaleExists } from "../../../middlewares/validateSale"
import { products } from "../../mocks/products"
import { validateProductExists } from "../../../middlewares/validateProduct"

jest.mock('../../../models/Product.model', () => ({
    findByPk: jest.fn(), //creamos la funcion findByPk
}))
describe('validateProduct - validateProductExist', () => {
    test('should handle non-existing Product', async () => {

        (Product.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'GET',
            params: { productId: 100 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateProductExists(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toStrictEqual({
            error: 'Producto no encontrado'
        })
        expect(next).not.toHaveBeenCalled()
    })
    test('should handle existing products[0]', async () => {

        (Product.findByPk as jest.Mock).mockResolvedValue(products[0])

        const req = createRequest({
            method: 'GET',
            params: { productId: 1 }
        })
        const res = createResponse()
        const next = jest.fn()

        await validateProductExists(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.product).toEqual(products[0])// esperamos que lo que se agregue ese midleware sea sale[0]
    })
    test('should get a error', async () => {

        //mandamos llamar el finByPk con una excepcion para que en cuanto s ejecute provocar un error y mandarlo al try catch
        (Product.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'GET',
            params: { productId: 1 }
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