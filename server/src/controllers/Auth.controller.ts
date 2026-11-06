import { register, activate, login } from '../services';
import { generateGoogleToken, generateTokens, successResponse } from '../lib';
import { RegisterSchema, LoginSchema, TokenModel } from '../database';
import { Response, Request, NextFunction } from 'express';
import { User } from '../database';
import { z } from 'zod';
import { config } from 'dotenv';
import { AuthenticatedRequest } from "../middlewares"
import jsonwebtoken from 'jsonwebtoken'
config();

class AuthController {
    async reg(req: Request, res: Response, next: NextFunction) {
        try {
            const result = RegisterSchema.safeParse(req.body);
            if (!result.success) {
                throw z.treeifyError(result.error).properties;
            }
            const {
                tokens,
                user: { username, email, id, stats, avatar, isSubmitted },
            } = await register(result.data);
            res.cookie('token', tokens.refresh, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            return successResponse(
                res,
                {
                    user: {
                        id,
                        username,
                        email,
                        stats,
                        avatar,
                        isSubmitted,
                    },
                    tokens: {
                        access: tokens.access,
                    },
                },
                201,
            );
        } catch (error) {
            next(error);
        }
    }
    async act(req: Request, res: Response, next: NextFunction) {
        try {
            const { token } = req.params;
            await activate(token as string);
            return successResponse(
                res,
                { message: 'Account successfully activated!' },
                200,
            );
        } catch (error) {
            next(error)
        }
    }

    async log(req: Request, res: Response, next: NextFunction) {
        try {
            const result = LoginSchema.safeParse(req.body);
            if (!result.success) {
                throw z.treeifyError(result.error).properties;
            }
            const { tokens, user: { id,
                username,
                email,
                stats,
                avatar,
                isSubmitted, }
            } = await login(result.data);
            res.cookie('token', tokens.refresh, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            return successResponse(
                res,
                {
                    user: {
                        id,
                        username,
                        email,
                        stats,
                        avatar,
                        isSubmitted,
                    },
                    tokens: {
                        access: tokens.access,
                    },
                },
                200,
            );
        } catch (error) {
            next(error);
        }
    }

    async googleCallback(req: Request, res: Response) {
        try {
            const user = req.user as {
                _id: string;
                username: string;
                email: string;
                avatar?: string;
            };
            if (!user) {
                return res.redirect(`${process.env.GOOGLE_USER}auth-error?message=unauthorized`);
            }

            const token = generateGoogleToken({
                id: user._id,
                username: user.username,
                email: user.email,
            });
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.redirect(`${process.env.CLIENT_URL!}`);
        } catch (error) {
            return res.redirect(`${process.env.GOOGLE_USER}auth-error?message=server-error`);
        }
    }

    async profile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as AuthenticatedRequest).user?.id;
            if (!userId) {
                const error = new Error("Unauthorized");
                (error as any).status = 401;
                throw error;
            }
            const user = await User.findById(userId).select("-password").lean();
            if (!user) {
                const error = new Error("User not found");
                (error as any).status = 404;
                throw error;
            }
            return successResponse(
                res,
                { ...user },
                200,
                "User profile fetched successfully"
            );
        } catch (error) {
            next(error);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'lax',
            });
            return successResponse(
                res,
                { message: 'Logged out successfully.' },
                200
            );
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.token;
            if (!refreshToken) {
                const error = new Error("Unauthorized: No refresh token");
                (error as any).status = 401;
                throw error;
            }
            const decoded = jsonwebtoken.verify(refreshToken, process.env.REFRESH_TOKEN!) as {
                id: string;
                username?: string;
                email: string;
            };
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                const error = new Error("Email not found");
                (error as any).status = 401;
                throw error;
            }
            if (decoded.username) {
                const error = new Error("Unauthorized: Google session expired");
                (error as any).status = 401;
                throw error;
            }
            const refreshInDb = await TokenModel.findOne({ user: user.id });
            if (!refreshInDb) {
                await TokenModel.deleteMany({ user: user.id });
                const error = new Error("Unauthorized: Token reuse detected");
                (error as any).status = 401;
                throw error;
            }
            await TokenModel.deleteOne({ user: user.id });
            res.clearCookie('token');
            const newTokens = generateTokens({
                email: user.email,
                id: user.id,
            });
            const refresh = new TokenModel({
                user: user.id,
                token: newTokens.refresh,
            });
            await refresh.save();
            res.cookie('token', newTokens.refresh, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
            return successResponse(res, {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    stats: user.stats,
                    avatar: user.avatar,
                    isSubmitted: user.isSubmitted,
                },
                tokens: {
                    access: newTokens.access,
                },
            }, 200);
        } catch (error) {
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                (error as any).status = 401;
            }
            next(error);
        }
    }



    async changePassword(req: Request, res: Response) {
        try {
            const { } = req.body;
            const user = await User.findOne({})
        } catch (error) {

        }
    }
}

export const { reg, act, log, googleCallback, profile, logout, refresh } = new AuthController();
