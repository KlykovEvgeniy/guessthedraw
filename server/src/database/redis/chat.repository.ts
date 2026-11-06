import { createMessage } from "../../lib";
import { connectClient } from "./client";
import { Player } from "./players.repostitory";

class ChatRepository {
    async sendMessage(roomId: string, text: string, playerId: string) {
        const client = await connectClient();
        const roomKey = createMessage(roomId);
        const user = await Player.getRoomPlayer(roomId, playerId);
        if (!user) throw new Error('No user id');
        const message = {
            username: user.username,
            text,
            id: user.id,
            timestamp: Date.now(),
        };
        await client.rPush(roomKey, JSON.stringify(message));
        await client.expire(roomKey, 7200);
        return message;
    }

    async getMessages(roomId: string) {
        const client = await connectClient();
        const roomKey = createMessage(roomId);
        const rawMessages = await client.lRange(roomKey, -50, -1);
        const messages = rawMessages.map(msg => JSON.parse(msg));
        return messages;
    }
}

export const Chat = new ChatRepository();