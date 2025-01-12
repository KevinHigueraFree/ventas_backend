import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {

  // checa la validacion
  // obtiene el resultado de la validacion
  let result = validationResult(req)
  if (!result.isEmpty()) {

    res.status(400).json({ errors: result.array() })
    return
  }

  next();// que pase al siguiente middleware
}