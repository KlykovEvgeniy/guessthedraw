import { Response as ExpressResponse } from 'express';

class R {
    successResponse(
        res: ExpressResponse,
        data: unknown,
        status: number = 200,
        message: string = 'success',
    ) {
        return res.status(status).json({
            success: true,
            message,
            data,
        });
    }
    errorResponse(
        res: ExpressResponse,
        data: unknown,
        status: number = 400,
        message: string = 'error',
    ) {
        return res.status(status).json({
            success: false,
            message,
            data,
        });
    }
}

export const { errorResponse, successResponse } = new R();
