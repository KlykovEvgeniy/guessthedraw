import { createRoomPlayerKey, createRoomKey } from "../../lib";
import { connectClient } from "./client";
import { type IRoomPlayer } from './types';
import { User } from "../mongoose/user.model";

class PlayerSettings {
  async addUserToRoom(roomId: string, playerId: string): Promise<IRoomPlayer> {
    const client = await connectClient();
    const roomKey = createRoomKey(roomId);
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerHashKey = `${playersSetKey}:${playerId}`;

    const maxPlayersStr = await client.hGet(roomKey, 'maxPlayers');
    if (!maxPlayersStr) {
      throw new Error("Room was not found or has expired");
    }
    const maxPlayers = parseInt(maxPlayersStr, 10);
    const isAlreadyInRoom = await client.sIsMember(playersSetKey, playerId);

    if (!isAlreadyInRoom) {
      await client.sAdd(playersSetKey, playerId);
      const currentPlayersCount = await client.sCard(playersSetKey);

      if (currentPlayersCount > maxPlayers) {
        await client.sRem(playersSetKey, playerId);
        throw new Error("Room is already full");
      }
    }
    const user = await User.findOne({ _id: playerId });
    if (!user) {
      if (!isAlreadyInRoom) await client.sRem(playersSetKey, playerId);
      throw new Error("User not found in database");
    }

    const playerData: IRoomPlayer = {
      id: playerId,
      username: user.username,
      score: 0,
      hasGuessed: false,
    };

    await client.multi()
      .hSet(playerHashKey, {
        id: playerData.id,
        username: playerData.username,
        score: String(playerData.score),
        hasGuessed: String(playerData.hasGuessed),
      })
      .expire(playerHashKey, 3 * 60 * 60)
      .expire(playersSetKey, 3 * 60 * 60)
      .exec();

    return playerData;
  }

  async getRoomPlayer(roomId: string, playerId: string): Promise<IRoomPlayer | null> {
    const client = await connectClient();
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerHashKey = `${playersSetKey}:${playerId}`;

    const data = await client.hGetAll(playerHashKey);
    if (!data || Object.keys(data).length === 0) return null;

    return {
      id: data.id,
      username: data.username,
      score: parseInt(data.score, 10),
      hasGuessed: data.hasGuessed === 'true',
    };
  }

  async kickPlayerByRoomId(roomId: string, playerId: string): Promise<void> {
    const client = await connectClient();
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerHashKey = `${playersSetKey}:${playerId}`;

    await client.multi()
      .del(playerHashKey)
      .sRem(playersSetKey, playerId)
      .exec();
  }

  async getRandomPlayer(roomId: string): Promise<string | null> {
    const client = await connectClient();
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerId = await client.sRandMember(playersSetKey);
    return playerId;
  }

  async resetRoundGuesses(roomId: string): Promise<void> {
    const client = await connectClient();
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerIds = await client.sMembers(playersSetKey);
    if (playerIds.length === 0) return;
    const multi = client.multi();
    playerIds.forEach((id) => {
      multi.hSet(`${playersSetKey}:${id}`, { hasGuessed: 'false' });
    });
    await multi.exec();
  }

  async markCorrectGuess(roomId: string, playerId: string, round: number): Promise<boolean> {
    const client = await connectClient();
    const playerHashKey = `${createRoomPlayerKey(roomId)}:${playerId}`;
    const firstCorrectGuess = await client.hSetNX(playerHashKey, `guessedRound:${round}`, 'true');
    if (firstCorrectGuess !== 1) return false;
    await client.hIncrBy(playerHashKey, 'score', 1);
    await client.hSet(playerHashKey, 'hasGuessed', 'true');
    return true;
  }

  async getPlayersInRoom(roomId: string) {
    const client = await connectClient();
    const playersSetKey = createRoomPlayerKey(roomId);
    const playerIds = await client.sMembers(playersSetKey);
    if (playerIds.length === 0) return [];

    const multi = client.multi();
    playerIds.forEach((id) => {
      multi.hGetAll(`${playersSetKey}:${id}`);
    });

    const results = await multi.exec();

    return results
      .map((data, index) => {
        if (!data || Object.keys(data).length === 0) return null;
        const raw = data as unknown as Record<string, string>;
        return {
          id: raw.id || playerIds[index],
          username: raw.username,
          score: parseInt(raw.score, 10) || 0,
          hasGuessed: raw.hasGuessed === 'true',
          isReady: raw.isReady === 'true',
        };
      })
      .filter((player) => player !== null);
  }
}

export const Player = new PlayerSettings();
