import { createRequest, createResponse } from 'node-mocks-http'
import { authController } from '../../../controllers/authController'
import User from '../../../models/User.model'
import { classToInvokable } from 'sequelize/lib/utils'
import { checkPassword, hashPassword } from '../../../utils/auth'
import { generateToken } from '../../../utils/token'
import { AuthEmail } from '../../../emails/AuthEmail'
import { check } from 'express-validator'
import { generateJWT } from '../../../utils/jwt'

// aplicamos todas las funciones que esten en este modelo
jest.mock('../../../models/User.model')
jest.mock('../../../utils/auth')
jest.mock('../../../utils/token')
jest.mock('../../../utils/jwt')

describe('authController.createAccount', () => {

    beforeEach(() => {
        jest.clearAllMocks() // limpiamos mocks
    })

    test('should return error 409 status an error message if the email is already registered', async () => {


        (User.findOne as jest.Mock).mockResolvedValue(true) // lo forzamos a que sea un true y si encuentre el email registrado

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'test@test.com',
                password: '123456'
            }
        })
        const res = createResponse()
        await authController.createAccount(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(409)
        expect(data).toHaveProperty('error', 'Este correo ya fue usado en otra cuenta') // evaluamos llave y valor de el objeto
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)


    })
    test('should return register a new user a success message', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                name: 'Santi',
                email: 'test@test.com',
                password: '1234567'
            }
        })

        const res = createResponse()
        const mockUser = {
            ...req.body, save: jest.fn()
        };

        // mockResolvedValue to asyn functions
        // mockReturnValue to syn functions
        (User.create as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');// sumalado como si se hasheara el password
        (generateToken as jest.Mock).mockReturnValue('123456');
        //spy es un metodo que espera aque se ejecute algo y luegodecide que es lo que tendra eso que se ejecutó
        //spyon toma dos argumentos (clase, nombre sobre el cual queremos esperar que se ejecute para modificar el comportamiento)
        jest.spyOn(AuthEmail, 'sendConfirmationEmail').mockImplementation(() => Promise.resolve());

        await authController.createAccount(req, res)

        const data = res._getJSONData()

        expect(User.create).toHaveBeenCalled()
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(mockUser.save).toHaveBeenCalled()
        expect(mockUser.password).toEqual('hashedPassword')
        expect(mockUser.token).toEqual('123456')
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1)
        expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
            name: req.body.name,
            email: req.body.email,
            token: '123456'
        })
        expect(res.statusCode).toBe(201)
        expect(data).toBe('Se creó la cuenta')


    })
    test('should return error', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(false)
        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                name: 'Santi',
                email: 'test@test.com',
                password: '1234567'
            }
        })

        const res = createResponse()
        const mockUser = {
            ...req.body, save: jest.fn()
        };

        // mockResolvedValue to asyn functions
        // mockReturnValue to syn functions
        (User.create as jest.Mock).mockRejectedValue(new Error);

        await authController.createAccount(req, res)

        const data = res._getJSONData()


        expect(User.create).toHaveBeenCalled()
        expect(User.create).toHaveBeenCalledTimes(1)
        expect(User.create).toHaveBeenCalledWith(req.body)
        expect(mockUser.save).not.toHaveBeenCalled()
        expect(AuthEmail.sendConfirmationEmail).not.toHaveBeenCalled()
        expect(res.statusCode).toBe(500)
        expect(data).toHaveProperty('error', 'Hubo un error')


    })
})
describe('authController.Login', () => {

    beforeEach(() => {
        jest.clearAllMocks() // limpiamos mocks
    })

    test('should return error 404 status an error message if the email is not registered', async () => {


        (User.findOne as jest.Mock).mockResolvedValue(false) // lo forzamos a que sea un true y si encuentre el email registrado

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'test@test.com',
                password: '123456'
            }
        })
        const res = createResponse()
        await authController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(404)
        expect(data).toHaveProperty('error', 'Este usuario no existe') // evaluamos llave y valor de el objeto
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)

    })

    test('should return error 403 status an error message if the user is not confirmed', async () => {

        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            email: 'test@test.com',
            password: '123456',
            confirmed: false
        }) // lo forzamos a que sea un true y si encuentre el email registrado

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'test@test.com',
                password: '123456',
            }
        })

        const res = createResponse()
        await authController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(403)
        expect(data).toHaveProperty('error', 'Este usuario no fue confirmado') // evaluamos llave y valor de el objeto
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)

    })
    test('should return error 401 status an error message if the password is incorrect', async () => {
        const userMock =
        {
            id: 1,
            email: 'test@test.com',
            password: '123456',
            confirmed: true
        };

        (User.findOne as jest.Mock).mockResolvedValue( userMock)


        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'test@test.com',
                password: '123456',
            }
        })

        const res = createResponse();


        (checkPassword as jest.Mock).mockResolvedValue(false);


        await authController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(401)
        expect(data).toHaveProperty('error', 'Contraseña incorrecta') // evaluamos llave y valor de el objeto
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password)
        expect(checkPassword).toHaveBeenCalledTimes(1)

    })
    test('should return error 401 status an error message if the password is incorrect', async () => {

        const userMock = {
            id: 1,
            email: 'test@test.com',
            password: '123456',
            confirmed: true
        };
        (User.findOne as jest.Mock).mockResolvedValue(userMock)

        const req = createRequest({
            method: 'POST',
            url: '/api/auth/create-account',
            body: {
                email: 'test@test.com',
                password: '123456',
            }
        })

        const JWTGenerado = 'JsonWebTokenGenerado'

        const res = createResponse();
        (checkPassword as jest.Mock).mockResolvedValue(true);
        (generateJWT as jest.Mock).mockReturnValue(JWTGenerado);

        await authController.login(req, res)

        const data = res._getJSONData()

        expect(res.statusCode).toBe(200)
        expect(data).toEqual(JWTGenerado) // evaluamos llave y valor de el objeto
        expect(User.findOne).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith(req.body.password, userMock.password)
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)
        expect(generateJWT).toHaveBeenCalledTimes(1)
        
    })

})