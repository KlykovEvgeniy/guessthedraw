import jsonwebtoken from 'jsonwebtoken';
import { config } from 'dotenv';
config();

interface IUser {
    id: string,
    username: string,
    email: string,
}

export function generateGoogleToken (data: IUser) {
    return jsonwebtoken.sign(data, process.env.REFRESH_TOKEN!, {
        expiresIn: '24h'
    })
};