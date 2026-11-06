import { createRoomKey, createRoomPlayerKey } from "../../lib";
import { connectClient } from "./client";
import { RoomStatus, type IRoom } from './types';
import { config } from "dotenv";
config();

class RoomSettings {
    async createRoom(
        roomId: string,
        ownerId: string,
        settings: Pick<IRoom, 'maxPlayers' | 'maxRounds' | 'drawTime' | 'isPrivate'>
    ): Promise<IRoom> {
        const client = await connectClient();
        const key = createRoomKey(roomId);

        const roomData = {
            id: roomId,
            ownerId: ownerId,
            status: RoomStatus.PENDING,
            maxPlayers: String(settings.maxPlayers),
            maxRounds: String(settings.maxRounds),
            drawTime: String(settings.drawTime),
            isPrivate: String(settings.isPrivate),
            currentRound: '0',
            currentWord: '',
            currentPainterId: '',
            roundEndsAt: '0',
        };

        await client.hSet(key, roomData);
        await client.expire(key, 3 * 60 * 60);
        return {
            id: roomId,
            ownerId: ownerId,
            status: RoomStatus.PENDING,
            maxPlayers: Number(settings.maxPlayers),
            maxRounds: Number(settings.maxRounds),
            drawTime: Number(settings.drawTime),
            isPrivate: Boolean(settings.isPrivate),
            currentRound: 0,
            currentWord: '',
            currentPainterId: '',
            roundEndsAt: 0,
        };
    }

    async getRoom(roomId: string): Promise<IRoom> {
        const client = await connectClient();
        const key = createRoomKey(roomId);
        console.log(key);
        const room = await client.hGetAll(key);
        console.log(room);
        if (!room || Object.keys(room).length === 0) {
            throw new Error(`Room with ID ${roomId} was not found`);
        }
        const raw = room as Record<string, string>;

        return {
            id: raw.id,
            ownerId: raw.ownerId,
            status: raw.status as RoomStatus,
            maxPlayers: parseInt(raw.maxPlayers, 10),
            maxRounds: parseInt(raw.maxRounds, 10),
            drawTime: parseInt(raw.drawTime, 10),
            isPrivate: raw.isPrivate === "true",
            currentRound: parseInt(raw.currentRound, 10),
            currentWord: raw.currentWord,
            currentPainterId: raw.currentPainterId,
            roundEndsAt: parseInt(raw.roundEndsAt || '0', 10),
        };
    }

    async getAllRoomsWithPublicStatus() {
        const client = await connectClient();
        const rooms: IRoom[] = [];
        for await (const key of client.scanIterator({ MATCH: 'room:*', COUNT: 100 })) {
            for (const item of key) {
                if (/^room:[^:]+$/.test(item)) {
                    const room = await client.hGetAll(item) as unknown as Record<string, string>;
                    const roomdId = room.id;
                    const pl = await client.sCard(`room:players:${roomdId}`);
                    if (room.isPrivate === 'false' && room.status === 'pending') {
                        rooms.push({
                            ...room,
                            currentPlayers: pl,
                        } as unknown as IRoom);
                    }

                }
            }
        }
        return rooms;
    }


    async deleteRoom(roomId: string): Promise<void> {
        const client = await connectClient();
        const key = createRoomKey(roomId);
        await client.del(key);
    }

    async updateRoomStatus(roomId: string, status: RoomStatus) {
        const client = await connectClient();
        const key = createRoomKey(roomId);
        await client.hSet(key, 'status', status);
    };

    async updateRoom(roomId: string, room: object) {
        const client = await connectClient();
        const keys = createRoomKey(roomId);
        console.log(keys);
        await client.hSet(keys, { ...room });
    }

    async claimRound(roomId: string, round: number): Promise<boolean> {
        const client = await connectClient();
        return (await client.hSetNX(createRoomKey(roomId), `roundClaimed:${round}`, 'true')) === 1;
    }

    async releaseRoundClaim(roomId: string, round: number): Promise<void> {
        const client = await connectClient();
        await client.hDel(createRoomKey(roomId), `roundClaimed:${round}`);
    }

    async claimRoundFinish(roomId: string, round: number): Promise<boolean> {
        const client = await connectClient();
        return (await client.hSetNX(createRoomKey(roomId), `roundFinished:${round}`, 'true')) === 1;
    }

    redirectPlayers(roomId: string): string {
        return `/rooms/game/draw/${roomId}`;
    };
}

export const Room = new RoomSettings();
