import type { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { errorHandler } from "../../lib";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
    };
}

export async function isAuth(req: Request, res: Response, next: NextFunction) {
    try {
        let token: string | undefined = undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
            const decoded = jsonwebtoken.verify(token as string, process.env.REFRESH_TOKEN!) as {id: string, username: string};
            if (!decoded) {
                throw new Error("Unauthorized");
            }
            if(!decoded.username) {
                throw new Error("Not authorized with google");
            }
            req.user = {
                id: decoded.id,
                username: decoded.username
            };
            return next();
        }
        if (!token) {
            throw new Error("Unauthorized");
        }
        const secret = process.env.ACCESS_TOKEN!;
        const decoded = jsonwebtoken.verify(token, secret) as { id: string; username: string };

        if (!decoded) {
            throw new Error("Unauthorized");
        }
        req.user = {
            id: decoded.id,
            username: decoded.username
        };

        next();
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error("Unauthorized");
        (err as any).status = 401;

        return errorHandler(err as Error & { status: number }, req, res, next);
    }
}
