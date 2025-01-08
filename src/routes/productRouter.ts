import { Router } from 'express'
import { productController } from '../controllers/productController';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../middlewares/validation';
import { validateProductByID, validateProductExists, validateProductInput } from '../middlewares/validateProduct';


const router = Router();

router.param('productId', validateProductByID,)
router.param('productId', validateProductExists,)

router.get('/', productController.getAll);

router.get('/:productId', productController.getById);

router.post('/',
    validateProductInput,
    handleInputErrors,
    productController.create);

router.put('/:productId',
    validateProductInput,

    body('enable')
        .isBoolean().withMessage('Valor invalido'),

    handleInputErrors,
    productController.update);

router.patch('/:productId', productController.updateEnable
);
router.delete('/:productId', productController.delete);


export default router