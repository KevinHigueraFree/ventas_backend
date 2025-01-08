import { createRequest, createResponse } from 'node-mocks-http'//usado  para pasar parametros
import { sales } from "../../mocks/sales"
import { saleController } from '../../../controllers/saleController'

import SaleProduct from '../../../models/SaleProduct.model'
import Sale from '../../../models/Sale.model'

//generamos un mock(simulacion) de el modelo sale
jest.mock('../../../models/Sale.model', () => ({
    findAll: jest.fn(), //creamos la funcion findAll
    create: jest.fn(), //creamos la funcion create
    findByPk: jest.fn(), //creamos la funcion findByPk
    update: jest.fn(), //creamos la funcion update
    destroy: jest.fn() //creamos la funcion destroy
}))
describe('saleController.getAll', () => {
    //beforeEach: es una funcionq ue se ejecuta antes de que cada teste inicie  
    //beforeAll: se ejecuta una sola vez antes que todos los test
    //afterAll: se ejecuta al finalizar todos los test 
    //afterEach: se ejecuta al finalizar cada test 
    beforeEach(() => {
        (Sale.findAll as jest.Mock).mockReset();
        // options es una variable que se pasa en automatico con todos los valores que estan en saleController cuando usamos findAll
        (Sale.findAll as jest.Mock).mockImplementation((options) => {
            const updatedSales = sales.filter(sale => sale.userId === options.where.userId)
            return Promise.resolve(updatedSales)
        }) //mockear el metodo findAll para que devuelva
    })

    test('should retrieve 2 sales for user with Id 1', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/sale',
            user: { id: 1 }
        })

        const res = createResponse();


        //cuando mande llamar el finAll retorna todos los sales gracias al mockResolvedValue
        await saleController.getAll(req, res)

        const data = res._getJSONData()

        expect(data.data).toHaveLength(2);// como data es un objeto, accedemos a dada.data para acceder al arreglo que buscamos acceder
        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
    })
    test('should retrieve 1 sales for user with Id 2', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/sale',
            user: { id: 2 }
        })


        const res = createResponse();
        await saleController.getAll(req, res)

        const data = res._getJSONData()

        expect(data.data).toHaveLength(1);// como data es un objeto, accedemos a dada.data para acceder al arreglo que buscamos acceder
        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
    })
    test('should retrieve 0 sales for user with Id 10', async () => {

        const req = createRequest({
            method: 'GET',
            url: '/api/sale',
            user: { id: 10 }
        })


        const res = createResponse();

        await saleController.getAll(req, res)

        const data = res._getJSONData()

        expect(data.data).toHaveLength(0);// como data es un objeto, accedemos a dada.data para acceder al arreglo que buscamos acceder
        expect(res.statusCode).toBe(200);
        expect(res.statusCode).not.toBe(404);
    })
    test('should handle error when fetching sales', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale',
            user: { id: 10 }
        })

        const res = createResponse();
        (Sale.findAll as jest.Mock).mockRejectedValue(new Error)// causa un error mockRejectValue
        await saleController.getAll(req, res)

        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toStrictEqual({ error: "Hubo un error" })// toStrictEqual verifica que sea tal cual

    })
})

describe('saleController.create', () => {
    test('Should create a new sale and respond with statusCode 201', async () => {

        const mockSale = {
            save: jest.fn().mockResolvedValue(true) // creamos la funcion save correctamente
        };
        (Sale.create as jest.Mock).mockResolvedValue(mockSale);// cuando usemos el metodo create vamos a decirle que tambien existe la funcion save 

        const req = createRequest({
            method: 'POST',
            url: '/api/sale',
            user: { id: 1 },
            body: { date: '2025-06-10' }
        })
        const res = createResponse();



        await saleController.create(req, res)
        const data = res._getJSONData()


        expect(res.statusCode).toBe(201);
        expect(data).toBe('Venta creada correctamente')
        expect(mockSale.save).toHaveBeenCalled()// verificar que sea llamado
        expect(mockSale.save).toHaveBeenCalledTimes(1) // verificar que solo sea llamado una vez
        expect(Sale.create).toHaveBeenCalledWith(req.body) // verificar que se este mandando llamar con req.body
    })

    test('should handle error when create sale', async () => {

        const mockSale = {
            save: jest.fn() // creamos la funcion save 
        };

        (Sale.create as jest.Mock).mockRejectedValue(new Error)

        const req = createRequest({
            method: 'POST',
            url: '/api/sale',
            user: { id: 1 },
            body: { date: '2025-06-12' }
        })
        const res = createResponse();


        await saleController.create(req, res)


        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toStrictEqual({ error: "Hubo un error" })// toStrictEqual verifica que sea tal cual
        expect(mockSale.save).not.toHaveBeenCalled()// verificar que no sea llamado
        expect(Sale.create).toHaveBeenCalledWith(req.body) // verificar que se este mandando llamar con req.body
    })


})


describe('saleController.getById', () => {

    beforeEach(() => {
        (Sale.findByPk as jest.Mock).mockImplementation((id) => {
            const sale = sales.filter(s => s.id === id)[0]// [0] para retornar un arreglo
            return Promise.resolve(sale)
        })
    })

    test('should return sale with id 1 and 3 sale_products', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId',
            sale: { id: 1 }
        })

        const res = createResponse();
        //cuando mande llamar el finAll retorna todos los sales gracias al mockResolvedValue
        await saleController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.sale_product).toHaveLength(3)
        expect(Sale.findByPk).toHaveBeenCalled()
        expect(Sale.findByPk).toHaveBeenCalledTimes(1)
        expect(Sale.findByPk).toHaveBeenCalledWith(req.sale.id, { // es mandado llamar con estos parametros
            include: [SaleProduct]
        })

    })
    test('should return sale with id 2 and 2 sale_products', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId',
            sale: { id: 2 }
        })

        const res = createResponse();
        //cuando mande llamar el finAll retorna todos los sales gracias al mockResolvedValue
        await saleController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.sale_product).toHaveLength(2)


    })
    test('should return sale with id 3 and 0 sale_products', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/sale/:saleId',
            sale: { id: 3 }
        })

        const res = createResponse();
        //cuando mande llamar el finAll retorna todos los sales gracias al mockResolvedValue
        await saleController.getById(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data.sale_product).toHaveLength(0)


    })
})

describe('saleController.update', () => {

    test('Should update sale and respond with statusCode 200', async () => {

        const saleMock = {
            update: jest.fn().mockResolvedValue(true) // creamos la funcion update correctamente
        };
        (Sale.update as jest.Mock).mockResolvedValue(saleMock);// cuando usemos el metodo update vamos a decirle que tambien existe la funcion save 

        const req = createRequest({
            method: 'PUT',
            url: '/api/sale/:saleId',
            sale: saleMock,
            body: { date: '2025-06-11' }
        })
        const res = createResponse();



        await saleController.update(req, res)
        const data = res._getJSONData()
      

        expect(res.statusCode).toBe(200);
        expect(data).toBe('Venta actualizada')
        expect(saleMock.update).toHaveBeenCalled()// verificar que sea llamado
        expect(saleMock.update).toHaveBeenCalledTimes(1)// verificar que sea llamado
        expect(saleMock.update).toHaveBeenCalledWith(req.body) // verificar que se este mandando llamar con req.body
    })
})
describe('saleController.delete', () => {

    test('Should delete sale', async () => {

        const saleMock = {
            destroy: jest.fn().mockResolvedValue(true) // creamos la funcion destroy correctamente
        };

        const req = createRequest({
            method: 'DELETE',
            url: '/api/sale/:saleId',
            sale: saleMock,

        })
        const res = createResponse();



        //mandamos llamar el metodo de saleController
        await saleController.delete(req, res)
        const data = res._getJSONData()


        expect(res.statusCode).toBe(200);
        expect(data).toBe('Venta eliminada')
        expect(saleMock.destroy).toHaveBeenCalled()
        expect(saleMock.destroy).toHaveBeenCalledTimes(1)
    })
})