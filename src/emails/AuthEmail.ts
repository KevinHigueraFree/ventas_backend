import { transport } from "../config/nodeMailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {

        const email = await transport.sendMail({
            from: 'Kevin Seller <higuerak048@gmail.com>',
            to: user.email,
            subject: 'Confirmar cuenta',
            html: `
        <h1>Hola ${user.name}</h1>
        <p>Gracias por registrarte en nuestra tienda. Para confirmar tu cuenta, haz click en el siguiente enlace:</p><br>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a><br>
        <p>Ingresa el código: <b>${user.token}</b> </p>
        `
        }, (error, info) => {
            if (error) {
                return console.log('Error occurred: ' + error.message);
            }
            console.log('Message sent: %s', info.messageId);
        })
    }
    static recoverPassword = async (user: EmailType) => {

        const email = await transport.sendMail({
            from: 'Kevin Seller <higuerak048@gmail.com>',
            to: user.email,
            subject: 'Recuperar contraseña',
            html: `
        <h1>Hola ${user.name}</h1>
        <p>Estas intentando recuperar tu cuenta. Para cambiar contraseña, haz click en el siguiente enlace:</p><br>
        <a href="${process.env.FRONTEND_URL}/auth/recover-password">Recuperar Cuenta</a><br>
        <p>Ingresa el código: <b>${user.token}</b> </p>
        `
        }, (error, info) => {
            if (error) {
                return console.log('Error occurred: ' + error.message);
            }
            console.log('Message sent: %s', info.messageId);
        })

    }
}
