//@ts-nocheck
import { Socket } from "socket.io";
import jsonwebtoken from 'jsonwebtoken';
import cookie from "cookie";
import { config } from "dotenv";
config();

interface DecodedToken {
    id: string;
    username: string;
}

export interface AuthenticatedSocket extends Socket {
    user?: DecodedToken;
    roomId?: string,
}

export async function isSocketAuth(socket: AuthenticatedSocket, next: (err?: any) => void) {
    try {
        let token: string | undefined = undefined;
        if (socket.handshake.auth && socket.handshake.auth.token) {
            token = socket.handshake.auth.token;
        }

        if (!token && socket.handshake.headers.cookie) {
            const cookies = cookie.parseCookie(socket.handshake.headers.cookie);
            token = cookies.token;
            const decoded = jsonwebtoken.verify(token, process.env.REFRESH_TOKEN);
            socket.user = {
                id: decoded.id,
                email: decoded.email,
            };
            socket.data.userId = decoded.id;
            return next();
        }
        if (!token) {
            return next(new Error("Unauthorized: Token missing"));
        }
        const decoded = await jsonwebtoken.verify(token, process.env.ACCESS_TOKEN);
        socket.user = {
            id: decoded.id,
            email: decoded.email,
        };
        socket.data.userId = decoded.id;
        console.log(socket.user);
        return next();
    } catch (error) {
        console.log(error);
        return next(new Error("Unauthorized: Invalid token"));
    }
}
