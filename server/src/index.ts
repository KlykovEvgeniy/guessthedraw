import dotenv from 'dotenv';
import express, { type Express } from 'express';
import mongoose from 'mongoose';
import { errorHandler, rateLimiter } from './lib';
import cookieParser from 'cookie-parser';
import path from 'path';
import passport from 'passport';
import { initGooglePassport } from './config';
import { connectClient } from './database';
import http from 'http';
import { isSocketAuth } from './middlewares';
import { roomController, paintController } from './controllers';
import cors from 'cors';
//Routes
import { AuthRouter, FeaturesRouter } from './routes';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from './middlewares/auth/isSocketAuth';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: '*',
        credentials: true,
    },
    transports: ['websocket'],
});
io.use(isSocketAuth);

//Sockets
io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(socket.id);
    socket.on('room:create', async (settings, next) => {
        await roomController.createRoom(socket, settings, next);
    });
    socket.on('room:join', async (data, next) => {
        await roomController.joinRoom(socket, data, next);
    });
    socket.on('room:leave', async (data, next) => {
        await roomController.leaveRoom(socket, data, next);
    });
    socket.on('room:get-players', async (data, next) => {
        await roomController.getAllPlayersInRoom(socket, data, next);
    });
    socket.on('disconnecting', async () => {
        await roomController.handleDisconnect(socket);
    });
    socket.on('room:chat:send', async (data, next) => {
        await roomController.createMessage(socket, data, next);
    });
    socket.on('room:game:start', async (data, next) => {
        await roomController.redirectToPlayersRoom(socket, data, next);
    })
    socket.on('room:game:playing', async (data, next) => {
        await roomController.redirectToPlayersRoomPlaying(socket, data, next);
    })
    socket.on('room:round:generate', async (data, next) => {
        console.log(data);
        await roomController.generateNewWord(socket, data, next);
    })
    socket.on('room:game:guess', async (data, next) => {
        await roomController.guessWord(socket, data, next);
    });
    socket.on('draw:start', async (data) => {
        await paintController.startDrawing(socket, data);
    });
    socket.on('draw:move', async (data) => {
        await paintController.drawMove(socket, data);
    });
    socket.on('draw:clear', async (data) => {
        await paintController.clearCanvas(socket, data);
    });
    socket.on('draw:fill', async (data) => {
        await paintController.fillArea(socket, data);
    });
})

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: '*',
    credentials: true,
}))
app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser());

initGooglePassport();
app.use(passport.initialize());
app.use(AuthRouter);
app.use(FeaturesRouter);
app.use(errorHandler);


async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URL!);
        await connectClient();
        const PORT = process.env.PORT || 3000;
        server.listen(PORT)
    } catch (error) {
        process.exit(1);
    }
}

startServer();

export { server, app };
