import { createRequest, createResponse } from "node-mocks-http";
import SaleProduct from "../../../models/SaleProduct.model";
import { saleProductController } from "../../../controllers/saleProductController";
import { products } from "../../mocks/products";
import { saleProducts } from "../../mocks/saleProducts";
jest.mock('../../../models/SaleProduct.model', () => ({
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn()
}))

describe('sale product to create new sale product', () => {
    test('should create a new sale_product', async () => {
        const saleProductMock = {
            save: jest.fn().mockResolvedValue(true)
        };
        (SaleProduct.create as jest.Mock).mockResolvedValue(saleProductMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/sale/:saleId/sale-product',
            body: {
                productId: 1,
                quantity: 2

            }
            ,
            sale: { id: 1 }
            ,
            product: products[0]
        })

        const res = createResponse()
        await saleProductController.create(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(201)
        expect(data).toEqual('Venta de producto creada')
        expect(saleProductMock.save).toHaveBeenCalled()
        expect(saleProductMock.save).toHaveBeenCalledTimes(1)
        expect(SaleProduct.create).toHaveBeenCalledWith(req.body)
    })
    test('should get a new Error', async () => {
        const saleProductMock = {
            save: jest.fn().mockRejectedValue(new Error)
        };
        (SaleProduct.create as jest.Mock).mockResolvedValue(saleProductMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/sale/:saleId/sale-product',
            body: {
                productId: 1,
                quantity: 2

            }
            ,
            sale: { id: 1 }
            ,
            product: products[0]
        })

        const res = createResponse()
        await saleProductController.create(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ error: "Hubo un error" })
    })
})

describe('SaleProductController.getAll', () => {
    beforeEach(() => {
        (SaleProduct.findAll as jest.Mock).mockReset();
        // options es una variable que se pasa en automatico con todos los valores que estan en saleController cuando usamos findAll
        (SaleProduct.findAll as jest.Mock).mockImplementation((options) => {
            const updatedSaleProducts = saleProducts.filter(saleProduct => saleProduct.saleId === options.where.saleId)
            return Promise.resolve(updatedSaleProducts)
        }) //mockear el metodo findAll para que devuelva
    })
    ,

    test('should return all sale_products', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product',
            params: {
                saleId: 1
            },
            saleProduct: saleProducts
        })
        const res = createResponse()
        await saleProductController.getAll(req, res)
        const data=res._getJSONData();
    
        expect(data.salesProducts).toHaveLength(3)
    })
})

describe('SaleProductController.getById', () => {
    test('shuld return sale_product with ID 1', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            saleProduct: saleProducts[0]
        })

        const res = createResponse()
        await saleProductController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(saleProducts[0]) // es lo que esperamos||

    })
})
describe('SaleProductController.update', () => {
    test('should handle sale product update  and success message', async () => {
        const saleProductMock = {
            ...saleProducts[0],
            update: jest.fn()
        };

        const req = createRequest({
            method: 'PUT',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            body: {
                productId: 1,
                quantity: 4
            },
            saleProduct: saleProductMock,

        })

        const res = createResponse()
        await saleProductController.update(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Venta de producto actualizada')
        expect(saleProductMock.update).toHaveBeenCalled()
        expect(saleProductMock.update).toHaveBeenCalledWith(req.body)
        expect(saleProductMock.update).toHaveBeenCalledTimes(1)

    })
})
describe('SaleProductController.delete', () => {
    test('should handle sale product delete and success message', async () => {
        const saleProductMock = {
            ...saleProducts[0],
            destroy: jest.fn()
        };

        const req = createRequest({
            method: 'DELETE',
            url: '/api/sale/:saleId/sale-product/:saleProductId',
            saleProduct: saleProductMock,

        })


        const res = createResponse()
        await saleProductController.delete(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Venta de producto eliminada')
        expect(saleProductMock.destroy).toHaveBeenCalled()
        expect(saleProductMock.destroy).toHaveBeenCalledTimes(1)

    })
})