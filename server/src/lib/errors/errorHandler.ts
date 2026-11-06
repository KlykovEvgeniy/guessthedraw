import { Request, Response as ExpressResponse, NextFunction } from 'express';
import { errorResponse } from './response';

export function errorHandler(
    err: Error & { status: number },
    req: Request,
    res: ExpressResponse,
    next: NextFunction,
) {
    return errorResponse(res, err, err.status || 400, err.message);
}
