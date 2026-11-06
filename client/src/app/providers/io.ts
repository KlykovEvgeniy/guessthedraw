import { io } from "socket.io-client";

export const socket = io('http://localhost:3000', {
    auth: {},
    withCredentials: true,
    transports: ['websocket'],
    upgrade: false,
})