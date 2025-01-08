import request from 'supertest';
import { authController } from '../../controllers/authController';
import User from '../../models/User.model';
import server from '../../server';
import * as authUtils from '../../utils/auth';
import * as jwtUtils from '../../utils/jwt';

describe('Authentication - Create Account', () => {

    test('should return  display error about validation input when  form is empty', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({})

        const createAccountMock = jest.spyOn(authController, 'createAccount')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(3)

        expect(response.statusCode).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    test('should return  400 error when email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Kevin",
                "email": "invalidemail.com",
                "password": "12345678"
            })

        const createAccountMock = jest.spyOn(authController, 'createAccount')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Correo inválido');

        expect(response.statusCode).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })

    test('should return  400 error when the password is less than 8 characteres', async () => {
        const response = await request(server)
            .post('/api/auth/create-account')
            .send({
                "name": "Kevin",
                "email": "valid@email.com",
                "password": "1234567"
            })

        const createAccountMock = jest.spyOn(authController, 'createAccount')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('La contraseña debe tener almenos 8 caracteres')

        expect(response.statusCode).not.toBe(201)
        expect(createAccountMock).not.toHaveBeenCalled()
    })


    test('should return staus code 200 when create account successful', async () => {
        const userData = {
            "name": "Kevin",
            "email": "correo@correo.com",
            "password": "12345678"
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        expect(response.statusCode).toBe(201)

        expect(response.statusCode).not.toBe(400)
        expect(response.body).not.toHaveProperty('errors')
    })

    test('should return staus code 409 conflict when user ir already registered', async () => {
        const userData = {
            "name": "Kevin",
            "email": "correo@correo.com",
            "password": "12345678"
        }

        const response = await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Este correo ya fue usado en otra cuenta')

        expect(response.status).not.toBe(400)
        expect(response.status).not.toBe(201)
        expect(response.body).not.toHaveProperty('errors')

    })
})

describe('validatAuth - Athentication - Create confirmation with Token', () => {
    test('sould display error if token is empty or lenght token is not 6  ', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token: "" })

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Token inválido')


    })
    test('sould display error if token does not exist  ', async () => {
        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token: "123456" })

        expect(response.statusCode).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Token inválido')

        expect(response.statusCode).not.toBe(200)


    })
    test('sould display confirm account', async () => {
        const token = globalThis.saleConfirmationToken // variable global creada en authccontroller al crear el toekn  en create account

        const response = await request(server)
            .post('/api/auth/confirm-account')
            .send({ token }) // token:token

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual('Cuenta confirmada')

        expect(response.statusCode).not.toBe(401)
    })
})


describe('Authentication - Login', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should return error if email or password is empty', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "", password: "" })

        const loginMock = jest.spyOn(authController, 'login')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(2)

        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(1)
        expect(loginMock).not.toHaveBeenCalled()
    })
    test('should return  status 400 when email is invalid', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "invalid", password: "12345678" })

        const loginMock = jest.spyOn(authController, 'login')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Correo inválido')

        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(loginMock).not.toHaveBeenCalled()
    })

    test('should return  status 400 when password is empty', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "correo@correo.com", password: "" })

        const loginMock = jest.spyOn(authController, 'login')// creamos un instancia de el mtodo createAccount de authController

        expect(response.statusCode).toBe(400)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveLength(1)
        expect(response.body.errors[0].msg).toBe('Contraseña obligatoria')

        expect(response.statusCode).not.toBe(200)
        expect(response.body.errors).not.toHaveLength(2)
        expect(loginMock).not.toHaveBeenCalled()
    })

    test('should return  status 404 when email is not registered', async () => {
        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "correo2@correo.com", password: "12345678" })

        expect(response.statusCode).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Este usuario no existe')

        expect(response.statusCode).not.toBe(200)
    })

    //forma 1: request with mock: simuling a user found with spyOn
    test('should return  status 403 when user is not confirmed', async () => {


        (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                email: "user_not_confirmed_correo@correo.com",
                password: "hashed_password",
                confirmed: false
            })

        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "user_not_confirmed_correo@correo.com", password: "12345678" })

        expect(response.statusCode).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Este usuario no fue confirmado')

        expect(response.statusCode).not.toBe(200)
        expect(response.statusCode).not.toBe(404)

    })
    //forma 2: request real: create a new user  but no confirmed, do a request to api
    test('should return  status 403 when user is not confirmed', async () => {

        const userData = {
            name: "Test",
            email: "user_not_confirmed_correo@correo.com",
            password: "12345678"
        }
        await request(server)
            .post('/api/auth/create-account')
            .send(userData)

        const response = await request(server)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            })

        expect(response.statusCode).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Este usuario no fue confirmado')

        expect(response.statusCode).not.toBe(200)
        expect(response.statusCode).not.toBe(404)

    })

    test('should return  status 401 when password is not correct', async () => {


        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue({
                id: 1,
                email: "user_confirmed_correo@correo.com",
                password: "12345678",
                confirmed: true
            })

        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(false)

        const response = await request(server)
            .post('/api/auth/login')
            .send({ email: "user_confirmed_correo@correo.com", password: "12345678" })

        expect(response.statusCode).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe('Contraseña incorrecta')

        expect(response.statusCode).not.toBe(200)
        expect(response.statusCode).not.toBe(404)
        expect(response.statusCode).not.toBe(403)

        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalled()
        expect(checkPassword).toHaveBeenCalledTimes(1)

    })
    test('should return  token', async () => {
        const userMock = {
            id: 1,
            email: "user_confirmed_correo@correo.com",
            password: "hashed_password",
            confirmed: true
        }

        const findOne = (jest.spyOn(User, 'findOne') as jest.Mock)
            .mockResolvedValue(userMock)

        const JWTGenerated = 'jwt_token'
        const checkPassword = jest.spyOn(authUtils, 'checkPassword').mockResolvedValue(true)
        const generateJWT = jest.spyOn(jwtUtils, 'generateJWT').mockReturnValue(JWTGenerated)

        const userBody = {
            email: "user_confirmed_correo@correo.com",
            password: "password"
        }

        const response = await request(server)
            .post('/api/auth/login')
            .send(userBody)

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual(JWTGenerated)
        expect(findOne).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalled()
        expect(checkPassword).toHaveBeenCalledTimes(1)
        expect(checkPassword).toHaveBeenCalledWith(userBody.password, userMock.password)
        expect(generateJWT).toHaveBeenCalled()
        expect(generateJWT).toHaveBeenCalledTimes(1)
        expect(generateJWT).toHaveBeenCalledWith(userMock.id)

        expect(response.statusCode).not.toBe(400)
        expect(response.statusCode).not.toBe(403)
    })
})

let jwt: string
async function authenticate() {
    const response = await request(server)
        .post('/api/auth/login')
        .send({
            email: "correo@correo.com",
            password: "12345678"
        })

    jwt = response.body;
    expect(response.statusCode).toBe(200)
}

//! sales area
describe('GET /api/sales', () => {

    beforeAll(() => {
        jest.restoreAllMocks()// RESTAUA LAS FUNCIONES D ELOS JEST.SPYON a su implementación original
    })

    beforeAll(async () => {
        await authenticate()
    })

    test('should reject unauthenticate access to sales without a jwt', async () => {
        const response = await request(server)
            .get('/api/sale')

        expect(response.body.error).toBe('No autorizado')
        expect(response.statusCode).toBe(401)
    })

    test('should reject unauthenticate access to sales without a jwt', async () => {
        const response = await request(server)
            .get('/api/sale')
            .auth('not_valid', { type: 'bearer' })

        expect(response.body.error).toBe('Token inválido')
        expect(response.statusCode).toBe(401)
    })

    test('should allow authenticate access to sales with a valid jwt', async () => {
        const response = await request(server)
            .get('/api/sale')
            .auth(jwt, { type: 'bearer' })

        console.log(response.body);
        expect(response.body.data).toHaveLength(0)

        expect(response.body.error).not.toBe('No autorizado')
        expect(response.statusCode).not.toBe(401)
    })


})
describe('POST /api/sale', () => {

    beforeAll(() => {
        jest.restoreAllMocks()
    })
    beforeAll(async () => {
        await authenticate();
    })

    test('should reject unauthenticate access to sales without a jwt', async () => {
        const response = await request(server)
            .post('/api/sale')

        expect(response.body.error).toBe('No autorizado')
        expect(response.statusCode).toBe(401)
    })
    test('should display validation when the form is subbmitted with invalid date', async () => {
        const response = await request(server)
            .post('/api/sale')
            .auth(jwt, { type: 'bearer' })
            .send({

            })

        console.log(response.body.errors);
        expect(response.statusCode).toBe(400)
        expect(response.body.errors).toHaveLength(3)
    })

})

describe('GET /api/sale/:saleId', () => {
    beforeAll(async () => {
        await authenticate();
    })

    test('should reject unauthenticate access to sales without a jwt', async () => {
        const response = await request(server)
            .get('/api/sale/1')

        expect(response.body.error).toBe('No autorizado')
        expect(response.statusCode).toBe(401)
    })

    test('should return 400 bad request when id is not valid', async () => {
        const response = await request(server)
            .get('/api/sale/not_valid')
            .auth(jwt, { type: 'bearer' })

        expect(response.statusCode).toBe(400)
        expect(response.body.errors).toBeDefined() // de que si esté dfinida
        expect(response.body.errors).toBeTruthy() // de que si sea verdadera, exista o tiene contenido

        expect(response.statusCode).not.toBe(401)
        expect(response.body.error).not.toBe('No autorizado')
    })

})




