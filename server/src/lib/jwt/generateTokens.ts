import jsonwebtoken from 'jsonwebtoken';
import { config } from 'dotenv';
import type { LoginInput } from '../../database';
config();

export function generateTokens({
    email,
    id,
}: Omit<LoginInput, 'password'> & { id: string }) {
    const payload = {
        email,
        id,
    };
    return {
        access: jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN!, { expiresIn: '15m' }),
        refresh: jsonwebtoken.sign(payload, process.env.REFRESH_TOKEN!, { expiresIn: '15m', }),
    };
}
