import { createRequest, createResponse } from "node-mocks-http"
import { productController } from "../../../controllers/productController"
import Product from "../../../models/Product.model";
import { products } from "../../mocks/products";
import { enable } from "colors";
import server from "../../../server";
import { request } from "express";
jest.mock('../../../models/Product.model', () => ({
    findAll: jest.fn(), //creamos la funcion findAll
    create: jest.fn(), //creamos la funcion create
    findByPk: jest.fn(), //creamos la funcion findByPk
    update: jest.fn(), //creamos la funcion update
    destroy: jest.fn(), //creamos la funcion destroy
    save: jest.fn() //creamos la funcion save
}))

describe('productController - create', () => {
    test('should return 201 and created true', async () => {

        (Product.create as jest.Mock).mockResolvedValue(true);// cuando usemos el metodo create vamos a decirle que tambien existe la funcion save 

        const req = createRequest({
            method: 'POST',
            url: '/api/products',
            body: { name: 'Leche', price: 100 }
        })
        const res = createResponse()

        await productController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(201)
        expect(data).toEqual({ data: true })
        expect(Product.create).toHaveBeenCalledWith(req.body)
        expect(Product.create).toHaveBeenCalledTimes(1)
    })
    test('should return  500 and error', async () => {

        (Product.create as jest.Mock).mockRejectedValue(new Error);// cuando usemos el metodo create vamos a decirle que tambien existe la funcion save 

        const req = createRequest({
            method: 'POST',
            url: '/api/products',
            body: { name: 'Leche', price: 100 }
        })
        const res = createResponse()

        await productController.create(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(500)
        expect(data).toEqual({ error: "Hubo un error" })

    })
})

describe('productController - getAll', () => {

    beforeEach(() => {
        (Product.findAll as jest.Mock).mockReset();
        // options es una variable que se pasa en automatico con todos los valores que estan en saleController cuando usamos findAll
        (Product.findAll as jest.Mock).mockResolvedValue(products) //mockear el metodo findAll para que devuelva
    })

    test('should return all products', async () => {

        //solo documentacion porque no se usa
        const req = createRequest({
            method: 'GET',
            url: '/api/products'
        })

        const res = createResponse()
        await productController.getAll(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual({ data: products })
        expect(data.data).toHaveLength(4)
        expect(Product.findAll).toHaveBeenCalledTimes(1)

    })
})
describe('productController - getById', () => {

    test('should return all products', async () => {

        //solo documentacion porque no se usa
        const req = createRequest({
            method: 'GET',
            url: '/api/product/:productId',
            params: { productId: 1 },
            product: products[0]
        })

        const res = createResponse()
        await productController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(products[0])


    })
})

describe('productController - update', () => {

    beforeEach(() => {
        (Product.update as jest.Mock).mockReset();
        // options es una variable que se pasa en automatico con todos los valores que estan en saleController cuando usamos findAll
        (Product.update as jest.Mock).mockResolvedValue(true) //mockear el metodo findAll para que devuelva
    })

    test('return product updated', async () => {
        const req = createRequest({
            method: 'PUT',
            url: '/api/product/:productId',
            body: {
                name: 'Producto Actualizado',
                price: 30,
                enable: true
            },
            product: Product // le pasamos el modelo
        })

        const res = createResponse()

        await productController.update(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Producto actualizado')
        expect(Product.update).toHaveBeenCalled()
        expect(Product.update).toHaveBeenCalledTimes(1)
        expect(Product.update).toHaveBeenCalledWith(req.body)
    })
})
describe('productController - updateEnable', () => {

    test('return product enable úpdate', async () => {
        const req = createRequest({
            method: 'PATCH',
            url: '/api/product/:productId',
            product: { ...products[0], save: jest.fn().mockResolvedValue(true) }, // habuilitamos la funcion save a req.product
        })

        const res = createResponse()

        await productController.updateEnable(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Disponibilidad actualizada')
        expect(req.product.enable).not.toBe(products[0].enable)
        expect(req.product.save).toHaveBeenCalled()
    })
})
describe('productController - delete', () => {

    beforeEach(() => {
        (Product.destroy as jest.Mock).mockReset();
        // options es una variable que se pasa en automatico con todos los valores que estan en saleController cuando usamos findAll
        (Product.destroy as jest.Mock).mockResolvedValue(true) //mockear el metodo findAll para que devuelva
    })

    test('return product deleted', async () => {
        const req = createRequest({
            method: 'DELETE',
            url: '/api/product/:productId',
            product: Product
           
        })

        const res = createResponse()

        await productController.delete(req, res)
        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual('Producto eliminado')
        expect(Product.destroy).toHaveBeenCalled()
        expect(Product.destroy).toHaveBeenCalledTimes(1)
    })
})