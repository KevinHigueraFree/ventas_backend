import { createRequest, createResponse } from "node-mocks-http"
import SaleProduct from "../../../models/SaleProduct.model"
import { saleProducts } from "../../mocks/saleProducts"
import { validateSaleProductExists, validateSaleProductIsSale } from "../../../middlewares/validateSaleProduct"
import { hasAccess } from "../../../middlewares/validateSale"
import { sales } from "../../mocks/sales"
import { products } from "../../mocks/products"
import Product from "../../../models/Product.model"

jest.mock('../../../models/SaleProduct.model', () => ({
    findByPk: jest.fn(), //creamos la funcion findByPk
    findOne: jest.fn(), //creamos la funcion findOne
}))

describe('validateSaleProduct - validateSaleProductExist', () => {

    test('should return non existing sale product with id 6', async () => {
        (SaleProduct.findByPk as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: { saleProductId: 6 }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductExists(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: 'Venta de producto no encontrada' })
        expect(next).not.toHaveBeenCalled();

    })

    test('should validate if saleProduct exists for id 1', async () => {
        (SaleProduct.findByPk as jest.Mock).mockResolvedValue(saleProducts[0])

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: { saleProductId: 1 }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductExists(req, res, next)

        expect(next).toHaveBeenCalled();
        expect(req.saleProduct).toEqual(saleProducts[0]);
        expect(SaleProduct.findByPk).toHaveBeenCalledWith(req.params.saleProductId, { // es mandado llamar con estos parametros
            include: [Product]
        })
    })

    test('should return error 500 for problem with data base', async () => {
        (SaleProduct.findByPk as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: { saleProductId: 6 }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductExists(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Hubo un error' })


    })
})
describe('validateSaleProduct - validateSaleProductIsSale', () => {

    test('should return non existing sale product  wit id 3 to sale with id 2', async () => {
        (SaleProduct.findOne as jest.Mock).mockResolvedValue(null)

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: {
                saleProductId: 3,
                saleId: 2
            }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductIsSale(req, res, next)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(404);
        expect(data).toEqual({ error: 'Esta venta de producto no pertenece a la venta' })
        expect(next).not.toHaveBeenCalled();

    })

    test('should return existing sale product  with id 4 is from sale with id 2', async () => {
        (SaleProduct.findOne as jest.Mock).mockResolvedValue(saleProducts[3])

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: { saleProductId: 4, saleId: 2 }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductIsSale(req, res, next)

        expect(next).toHaveBeenCalled();
        expect(req.saleProduct).toEqual(saleProducts[3]);

    })
    test('should return error 500 for problem with data base', async () => {
        (SaleProduct.findOne as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            params: { saleProductId: 4, saleId: 2 }
        })

        const res = createResponse()
        const next = jest.fn();

        await validateSaleProductIsSale(req, res, next)
        const data = res._getJSONData()

        expect(next).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({ error: 'Hubo un error' })
    })

    // verificar que tiene acceso el usuario a la venta
    test('should prevent unautorized users from adding saleProduct', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/sale/:saleId/sale-product',
            sale: sales[0],
            user: { id: 2 },
            body: {
                productId: 1,
                quantity: 2

            }
            ,
            product: products[0]
        })


        const res = createResponse()
        const next = jest.fn();

        hasAccess(req, res, next)

        const data = res._getJSONData();
        expect(res.statusCode).toBe(401)
        expect(data).toEqual({ error: 'No tienes acceso a esta venta' })
        expect(next).not.toHaveBeenCalled();

    })
    test('should prevent autorized user from adding saleProduct', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/sale/:saleId/sale-product',
            sale: sales[0],
            user: { id: 1 },
            body: {
                productId: 1,
                quantity: 2

            }
            ,
            product: products[0]
        })


        const res = createResponse()
        const next = jest.fn();

        hasAccess(req, res, next)

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      

    })
})