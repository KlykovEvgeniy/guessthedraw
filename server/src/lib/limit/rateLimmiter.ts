import { rateLimit } from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10000,
    message: "To much requests. Try later.",
    statusCode: 429,
    legacyHeaders: false,
});