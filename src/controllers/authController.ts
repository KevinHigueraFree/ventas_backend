import { Request, Response } from "express"
import User from "../models/User.model"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class authController {
    static createAccount =
        async (req: Request, res: Response) => {

            const { email, password } = req.body

            //prevenir duplicados
            const userExist = await User.findOne({ where: { email } })// wehre:{email}= where:{email:email}       if (!userExist)
            if (userExist) {
                const error = new Error('Este correo ya fue usado en otra cuenta')
                res.status(409).json({ error: error.message })
                return
            }

            try {
                const user = await User.create(req.body)
                user.password = await hashPassword(password)
                const token = generateToken();
                user.token = token

                if (process.env.NODE_ENV !== 'production') {
                    globalThis.saleConfirmationToken = token
                }
                await user.save()


                await AuthEmail.sendConfirmationEmail({
                    name: user.name,
                    email: user.email,
                    token: user.token
                })

                res.status(201).json('Se creó la cuenta')

            } catch (error) {
                res.status(500).json({ error: 'Hubo un error' })

            }
        }
    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({
            where: {
                token: token
            }
        })

        if (!user) {
            const error = new Error('Token inválido')
            res.status(401).json({ error: error.message })
            return
        }

        user.confirmed = true
        user.token = null
        await user.save()

        res.json('Cuenta confirmada')

    }
    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        const user = await User.findOne({ where: { email } })// wehre:{email}= where:{email:email}       if (!userExist)
        if (!user) {
            const error = new Error('Este usuario no existe')
            res.status(404).json({ error: error.message })
            return
        }

        if (!user.confirmed) {
            const error = new Error('Este usuario no fue confirmado')
            res.status(403).json({ error: error.message })
            return
        }

        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Contraseña incorrecta')
            res.status(401).json({ error: error.message })
            return
        }

        const token = generateJWT(user.id)

        res.json(token)
    }
    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body
        const user = await User.findOne({ where: { email } })

        if (!user) {
            const error = new Error('Este usuario no existe ')
            res.status(404).json({ error: error.message })
            return
        }

        user.token = generateToken()
        await user.save()
        await AuthEmail.recoverPassword({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json('Revisa tu email para instrucciones')
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body
        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token inválido')
            res.status(401).json({ error: error.message })
            return
        }
        res.json('Token valido, escribe la nueva contraseña')
    }
    static resetPassword = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token inválido')
            res.status(401).json({ error: error.message })
            return
        }

        user.password = await hashPassword(password)
        user.token = null
        await user.save()

        res.json('Contraseña actualizada')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)
        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if ((!isPasswordCorrect)) {
            const error = new Error('Contraseña actual incorrecta')
            res.status(401).json({ error: error.message })
            return
        }

        user.password = await hashPassword(password)
        await user.save()
        res.json(user)
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)
        const isPasswordCorrect = await checkPassword(password, user.password)

        if ((!isPasswordCorrect)) {
            const error = new Error('Contraseña incorrecta')
            res.status(401).json({ error: error.message })
            return
        }


        res.json('Contraseña correcta')
    }
}