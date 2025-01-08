import { Router } from 'express'
import { handleInputErrors } from '../middlewares/validation';
import { saleController } from '../controllers/saleController';
import { saleProductController } from '../controllers/saleProductController';
import { hasAccess, validateSaleByID, validateSaleExists, validateSaleInput } from '../middlewares/validateSale';
import { validateSaleProductByID, validateSaleProductExists, validateSaleProductInput, validateSaleProductIsSale } from '../middlewares/validateSaleProduct';
import { body, param } from 'express-validator';
import { validateProductExists } from '../middlewares/validateProduct';
import { authenticate } from '../middlewares/validateAuth';

const router = Router();

//protege los metodos para verificar que esta autenticado
router.use(authenticate)

router.param('saleId', validateSaleByID)
router.param('saleId', validateSaleExists) // genera req.sale
router.param('saleId', hasAccess) // evita que se  acceda a ventas que no correspondan con el id de el usuario que está logeado con el JWT

router.param('saleProductId', validateSaleProductByID)
router.param('saleProductId', validateSaleProductExists)
router.param('saleProductId', validateSaleProductIsSale)

router.get('/', saleController.getAll);

router.get('/:saleId', saleController.getById);

router.post('/',
    validateSaleInput,
    handleInputErrors,
    saleController.create
);

router.put('/:saleId',
    validateSaleInput,
    handleInputErrors,
    saleController.update);

router.delete('/:saleId', saleController.delete);

//! area de sale_saleProduct

router.get('/:saleId/sale-product', saleProductController.getAll)
router.get('/:saleId/sale-product/:saleProductId', saleProductController.getById)

router.post('/:saleId/sale-product',
    validateSaleProductInput,
    validateProductExists,
    
    handleInputErrors,
    saleProductController.create
)

router.delete('/:saleId/sale-product/:saleProductId', saleProductController.delete)

export default router