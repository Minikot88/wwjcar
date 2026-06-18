import { validationResult } from 'express-validator';
import { HttpError } from '../utils/httpError.js';

export function validate(request, _response, next) {
  const result = validationResult(request);

  if (!result.isEmpty()) {
    throw new HttpError(422, 'Validation failed', result.array());
  }

  next();
}
