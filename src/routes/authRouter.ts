import { Router } from 'express'
import { authController } from '../controllers/authController'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middlewares/validateAuth'

const router = Router()
router.use(limiter)

router.post('/create-account',

    body('name')
        .notEmpty().withMessage('Falta el nombre'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener almenos 8 caracteres'),
    body('email')
        .isEmail().withMessage('Correo inválido'),
    handleInputErrors,

    authController.createAccount
)

router.post('/confirm-account',
    body('token')
        .isLength({ min: 6, max: 6 }).withMessage('Token inválido'),

    handleInputErrors,
    authController.confirmAccount
)

router.post('/login',
    body('email')
        .isEmail().withMessage('Correo inválido'),
    body('password')
        .notEmpty().withMessage('Contraseña obligatoria'),

    handleInputErrors,
    authController.login
)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('Correo inválido'),
    handleInputErrors,
    authController.forgotPassword
)

router.post('/validate-token',
    body('token')
        .notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token inválido'),

    handleInputErrors,
    authController.validateToken
)

router.post('/reset-password/:token',
    param('token')
        .notEmpty().isLength({ min: 6, max: 6 }).withMessage('Token inválido'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),

    handleInputErrors,
    authController.resetPassword
)

router.get('/user',
    authenticate,
    authController.user)



router.post('/update-password',
    authenticate,
    body('current_password')
        .notEmpty().withMessage('La contraseña actual no puede ir vacía'),
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña nueva debe tener al menos 8 caracteres'),

    handleInputErrors,
    authController.updateCurrentUserPassword
)
router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('La contraseña actual no puede ir vacía'),

    handleInputErrors,
    authController.checkPassword
)
export default router