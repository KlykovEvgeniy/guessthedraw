import crypto from 'crypto';
import { AuthenticatedSocket } from '../middlewares/auth/isSocketAuth';
import { Room, Player, Chat, User } from '../database';
import { IRoom, RoomStatus } from '../database/redis/types';
import { NextFunction } from 'express';

const skribblWordList = [
    'dog', 'cat', 'elephant', 'giraffe', 'lion', 'monkey', 'penguin', 'shark', 'whale', 'octopus', 'butterfly', 'spider', 'turtle', 'rabbit', 'chicken', 'dolphin', 'kangaroo', 'hamster', 'crocodile', 'parrot',
    'apple', 'banana', 'pizza', 'burger', 'sushi', 'taco', 'icecream', 'cake', 'cookie', 'cheese', 'bread', 'chocolate', 'carrot', 'tomato', 'potato', 'watermelon', 'sandwich', 'egg', 'donut', 'coffee',
    'table', 'chair', 'bed', 'sofa', 'lamp', 'clock', 'mirror', 'window', 'door', 'television', 'fridge', 'pillow', 'blanket', 'computer', 'phone', 'key', 'spoon', 'fork', 'knife', 'cup',
    'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'rainbow', 'tree', 'flower', 'mountain', 'river', 'ocean', 'island', 'forest', 'desert', 'fire', 'volcano', 'grass', 'leaf', 'earth', 'alien', 'rocket',
    'shirt', 'pants', 'shoes', 'hat', 'socks', 'dress', 'jacket', 'skirt', 'boots', 'gloves', 'scarf', 'glasses', 'tie', 'crown', 'belt',
    'doctor', 'police', 'firefighter', 'teacher', 'chef', 'pilot', 'astronaut', 'actor', 'artist', 'farmer', 'pirate', 'ninja', 'king', 'queen', 'wizard', 'ghost', 'zombie', 'monster',
    'car', 'bus', 'train', 'plane', 'boat', 'bicycle', 'helicopter', 'submarine', 'truck', 'motorcycle'
];

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * skribblWordList.length);
    return skribblWordList[randomIndex];
};


type ISettings = Pick<IRoom, 'maxPlayers' | 'maxRounds' | 'drawTime' | 'isPrivate'>

class RoomController {
    private readonly roundTimers = new Map<string, ReturnType<typeof setTimeout>>();

    async createRoom(socket: AuthenticatedSocket, settings: ISettings, next: NextFunction) {
        try {
            const userId = socket.user?.id;
            if (!userId) {
                return next({ success: false, message: "Unauthorized" });
            }
            const roomId = crypto.randomBytes(3).toString('hex');
            const newRoom = await Room.createRoom(roomId, userId, settings);
            const playerData = await Player.addUserToRoom(roomId, userId);

            socket.roomId = roomId;
            await socket.join(roomId);

            return next({
                success: true,
                data: {
                    room: newRoom,
                    player: playerData,
                    players: [playerData]
                }
            })
        } catch (error: unknown) {
            return next({
                success: false,
                message: (error as Error).message || "Failed to create room",
            })
        }
    }

    async joinRoom(socket: AuthenticatedSocket, data: { roomId: string }, next: Function) {
        try {
            const userId = socket.user?.id;
            const { roomId } = data;
            if (!userId) return next({ success: false, message: "Unauthorized" });
            if (!roomId) return next({ success: false, message: "Room ID is required" });

            const roomData = await Room.getRoom(roomId);
            const playerData = await Player.addUserToRoom(roomId, userId);

            socket.roomId = roomId;
            await socket.join(roomId);
            if (roomData.status === RoomStatus.PLAYING && roomData.currentRound > 0) {
                this.scheduleRoundEnd(socket, roomId, roomData.currentRound, roomData.roundEndsAt);
                if (roomData.currentPainterId === userId) {
                    socket.emit('room:game:word', roomData.currentWord);
                }
            }

            const players = await Player.getPlayersInRoom(roomId);

            socket.to(roomId).emit('player:joined', playerData);

            return next({
                success: true,
                data: {
                    room: { ...roomData, currentWord: '', wordLength: roomData.currentWord.length },
                    player: playerData,
                    players: players
                }
            })
        } catch (error: unknown) {
            return next({
                success: false,
                message: (error as Error).message || "Failed to join room",
            })
        }
    }

    async getAllPlayersInRoom(socket: AuthenticatedSocket, data: { roomId: string }, next: Function) {
        try {
            const { roomId } = data;
            if (!roomId) return next({ success: false, message: "Room ID is required" });
            const players = await Player.getPlayersInRoom(roomId);
            return next({
                success: true,
                data: { players }
            });
        } catch (error: unknown) {
            return next({
                success: false,
                message: (error as Error).message || "Failed to get players in room"
            });
        }
    }

    async leaveRoom(socket: AuthenticatedSocket, data: { roomId: string }, next: Function) {
        try {
            const userId = socket.user?.id;
            const { roomId } = data;
            if (!userId) return next({ success: false, message: "Unauthorized" });
            if (!roomId) return next({ success: false, message: "Room ID is required" });

            await Player.kickPlayerByRoomId(roomId, userId);

            socket.to(roomId).emit('player:left', { id: userId });

            await socket.leave(roomId);
            socket.roomId = undefined;

            return next({ success: true, message: "You left the room successfully" });
        } catch (error) {
            return next({
                success: false,
                message: (error as Error).message || "Failed to leave room"
            })
        }
    }

    async handleDisconnect(socket: AuthenticatedSocket) {
        const userId = socket.user?.id;
        if (!userId) return;

        const roomId = socket.roomId;

        if (roomId) {
            await Player.kickPlayerByRoomId(roomId, userId);
            socket.to(roomId).emit("player:left", { id: userId });
        }
    }

    async createMessage(socket: AuthenticatedSocket, data: { roomId: string, text: string }, next: NextFunction) {
        try {
            const userId = socket.user?.id;
            if (!userId) return next({ success: false, message: "Unauthorized" });
            if (!data.roomId || !data.text) return next({ success: false, message: "Room ID and text are required" });
            const message = await Chat.sendMessage(data.roomId, data.text, userId);
            socket.nsp.to(data.roomId).emit('room:chat:send-message', message);
            next({
                success: true,
                message,
            });
        } catch (error) {
            next({
                success: false,
                message: (error as Error).message || 'Something went wrong',
            });
        }
    }

    async getMessages(socket: AuthenticatedSocket, data: { roomId: string }, next: NextFunction) {
        try {
            const userId = socket.user?.id;
            if (!userId) return next({ success: false, message: "Unauthorized" });
            if (!data.roomId) return next({ success: false, message: "Room ID is required" });
            const messages = await Chat.getMessages(data.roomId);
            next({
                success: true,
                messages,
            });
        } catch (error) {
            next({
                success: false,
                message: (error as Error).message || 'Something went wrong',
            });
        }
    }

    async redirectToPlayersRoom(socket: AuthenticatedSocket, data: { roomId: string }, next: NextFunction) {
        try {
            const redirectUrl = Room.redirectPlayers(data.roomId);
            if (redirectUrl) {
                await Room.updateRoomStatus(data.roomId, RoomStatus.STARTING);
                socket.nsp.to(data.roomId).emit('room:game:started', redirectUrl);
            };
            next({
                success: true,
                message: redirectUrl,
            })
        } catch (error) {
            next({
                success: false,
                message: (error as Error).message || 'Something went wrong',
            });
        }
    }

    async redirectToPlayersRoomPlaying(socket: AuthenticatedSocket, data: { roomId: string }, next: NextFunction) {
        try {
            await Room.updateRoomStatus(data.roomId, RoomStatus.PLAYING);
            socket.nsp.to(data.roomId).emit('room:game:playings', true);
            next({
                success: true,
            })
        } catch (error) {
            next({
                success: false,
                message: (error as Error).message || 'Something went wrong',
            });
        }
    }
    private scheduleRoundEnd(socket: AuthenticatedSocket, roomId: string, round: number, endsAt: number) {
        const existingTimer = this.roundTimers.get(roomId);
        if (existingTimer) clearTimeout(existingTimer);
        const remainingTime = Math.max(0, endsAt - Date.now());
        const timer = setTimeout(() => {
            this.roundTimers.delete(roomId);
            void this.finishRound(socket, roomId, round).catch((error) => {
                console.error('Failed to finish timed-out round:', error);
            });
        }, remainingTime);
        this.roundTimers.set(roomId, timer);
    }

    private async startRound(socket: AuthenticatedSocket, roomId: string, expectedRound: number) {
        let claimedRound = false;
        try {
            const room = await Room.getRoom(roomId);
            if (room.status !== RoomStatus.PLAYING) {
                return;
            }
            if (room.currentRound !== expectedRound) {
                return;
            }
            const nextRound = expectedRound + 1;
            claimedRound = await Room.claimRound(roomId, nextRound);
            if (!claimedRound) {
                return;
            }

            const players = await Player.getPlayersInRoom(roomId);
            const alternativePlayers = players.filter((player) => player.id !== room.currentPainterId);
            const nextPainterId = alternativePlayers.length > 0
                ? alternativePlayers[Math.floor(Math.random() * alternativePlayers.length)].id
                : players[0]?.id || room.ownerId;
            const roundEndsAt = Date.now() + room.drawTime * 1000;
            const nextRoom = {
                ...room,
                currentRound: nextRound,
                currentWord: getRandomWord(),
                currentPainterId: nextPainterId,
                roundEndsAt,
            };
            await Player.resetRoundGuesses(roomId);
            await Room.updateRoom(roomId, {
                currentRound: String(nextRound),
                currentWord: nextRoom.currentWord,
                currentPainterId: nextPainterId,
                roundEndsAt: String(roundEndsAt),
            });
            const updatedRoom = await Room.getRoom(roomId);
            await this.broadcastRoundStarted(socket, updatedRoom);
            this.scheduleRoundEnd(socket, roomId, nextRound, roundEndsAt);
            claimedRound = false;
        } catch (error) {
            if (claimedRound) {
                await Room.releaseRoundClaim(roomId, expectedRound + 1);
            }
            console.error('Failed to start game round:', error);
            throw error;
        }
    }

    private async broadcastRoundStarted(socket: AuthenticatedSocket, room: IRoom) {
        socket.nsp.to(room.id).emit('room:round:started', {
            ...room,
            currentWord: '',
            wordLength: room.currentWord.length,
        });
        const roomSockets = await socket.nsp.in(room.id).fetchSockets();
        roomSockets.forEach((roomSocket) => {
            if ((roomSocket.data as { userId?: string }).userId === room.currentPainterId) {
                roomSocket.emit('room:game:word', room.currentWord);
            }
        });
    }

    private async finishRound(socket: AuthenticatedSocket, roomId: string, round: number) {
        const room = await Room.getRoom(roomId);
        if (room.status !== RoomStatus.PLAYING || room.currentRound !== round) return;
        if (!(await Room.claimRoundFinish(roomId, round))) return;
        const timer = this.roundTimers.get(roomId);
        if (timer) {
            clearTimeout(timer);
            this.roundTimers.delete(roomId);
        }
        socket.nsp.to(roomId).emit('room:game:round-ended', { word: room.currentWord });

        if (round >= room.maxRounds) {
            const players = await Player.getPlayersInRoom(roomId);
            await Promise.all(players.map((player) =>
                User.updateOne(
                    { _id: player.id, completedGameIds: { $ne: roomId } },
                    {
                        $inc: {
                            'stats.score': player.score,
                            'stats.gamePlayed': 1,
                        },
                        $addToSet: { completedGameIds: roomId },
                    }
                )
            ));

            const finishedRoom = { ...room, status: RoomStatus.FINISHED, currentWord: '', roundEndsAt: 0 };
            await Room.updateRoom(roomId, {
                status: RoomStatus.FINISHED,
                currentWord: '',
                roundEndsAt: '0',
            });
            socket.nsp.to(roomId).emit('room:game:finished', { ...finishedRoom, currentWord: '' });
            return;
        }

        await this.startRound(socket, roomId, round);
    }

    async generateNewWord(socket: AuthenticatedSocket, data: { roomId: string }, callback: (response: any) => void) {
        try {
            const { roomId } = data;
            if (!roomId) return callback?.({ success: false, message: "Room ID is required" });
            const room = await Room.getRoom(roomId);
            if (room.status !== RoomStatus.PLAYING) {
                return callback?.({ success: false, message: "The game has not started" });
            }
            if (room.currentRound > 0) {
                if (room.currentPainterId === socket.user?.id) {
                    socket.emit('room:game:word', room.currentWord);
                }
                return callback?.({
                    success: true,
                    room: { ...room, currentWord: '', wordLength: room.currentWord.length },
                });
            }
            await this.startRound(socket, roomId, 0);
            const updatedRoom = await Room.getRoom(roomId);
            callback?.({
                success: true,
                room: { ...updatedRoom, currentWord: '', wordLength: updatedRoom.currentWord.length },
            });
        } catch (error) {
            console.error('Failed to generate game word:', error);
            if (typeof callback === 'function') {
                callback({
                    success: false,
                    message: (error as Error).message || 'Something went wrong',
                });
            }
        }
    }

    async guessWord(socket: AuthenticatedSocket, data: { roomId: string; text: string }, callback: (response: any) => void) {
        try {
            const playerId = socket.user?.id;
            const text = data.text?.trim();
            if (!playerId || !data.roomId || !text) {
                return callback?.({ success: false, message: 'A room and a guess are required' });
            }
            const room = await Room.getRoom(data.roomId);
            const player = await Player.getRoomPlayer(data.roomId, playerId);
            if (!player || room.status !== RoomStatus.PLAYING || room.currentRound < 1) {
                return callback?.({ success: false, message: 'The game is not accepting guesses' });
            }
            if (room.roundEndsAt <= Date.now()) {
                await this.finishRound(socket, data.roomId, room.currentRound);
                return callback?.({ success: false, message: 'Time is up' });
            }
            if (playerId === room.currentPainterId) {
                return callback?.({ success: false, message: 'The painter cannot guess' });
            }

            const normalize = (value: string) => value.toLocaleLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalize(text) !== normalize(room.currentWord)) {
                const message = await Chat.sendMessage(data.roomId, text, playerId);
                socket.nsp.to(data.roomId).emit('room:chat:send-message', message);
                return callback?.({ success: true, correct: false });
            }

            const firstCorrectGuess = await Player.markCorrectGuess(data.roomId, playerId, room.currentRound);
            if (!firstCorrectGuess) {
                return callback?.({ success: true, correct: true });
            }
            const message = await Chat.sendMessage(data.roomId, 'guessed the word!', playerId);
            socket.nsp.to(data.roomId).emit('room:chat:send-message', message);
            const updatedPlayer = await Player.getRoomPlayer(data.roomId, playerId);
            socket.nsp.to(data.roomId).emit('room:game:guessed', {
                playerId,
                username: player.username,
                score: updatedPlayer?.score ?? player.score + 1,
            });
            callback?.({ success: true, correct: true });

            const players = await Player.getPlayersInRoom(data.roomId);
            const guessers = players.filter((roomPlayer) => roomPlayer.id !== room.currentPainterId);
            if (guessers.length > 0 && guessers.every((roomPlayer) => roomPlayer.hasGuessed)) {
                await this.finishRound(socket, data.roomId, room.currentRound);
            }
        } catch (error) {
            console.error('Failed to check game guess:', error);
            callback?.({ success: false, message: 'Failed to check your guess' });
        }
    }
}

export const roomController = new RoomController();
