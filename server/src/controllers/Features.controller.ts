import type { NextFunction, Request, Response } from "express"
import { Chat, User } from "../database"
import { successResponse } from "../lib";
import { Room } from "../database";

class Features {
    async dashboard(req: Request, res: Response, next: NextFunction) {
        try {
            const [topGames, topScores, topWon] = await Promise.all([
                User.find({}).sort({ 'stats.gamePlayed': -1 }).limit(50).select({
                    username: 1,
                    'stats.score': 1,
                    'stats.gamePlayed': 1,
                    'stats.gamesWon': 1,
                }),
                User.find({}).sort({ 'stats.score': -1 }).limit(50).select({
                    username: 1,
                    'stats.score': 1,
                    'stats.gamePlayed': 1,
                    'stats.gamesWon': 1,
                }),
                User.find({}).sort({ 'stats.gamesWon': -1 }).limit(50).select({
                    username: 1,
                    'stats.score': 1,
                    'stats.gamePlayed': 1,
                    'stats.gamesWon': 1,
                }),
            ])
            return successResponse(res, { games: topGames, score: topScores, wins: topWon }, 200);
        } catch (error) {
            return next(error)
        }
    }

    async getAllPublicRooms(req: Request, res: Response, next: NextFunction) {
        try {
            const rooms = await Room.getAllRoomsWithPublicStatus();
            return successResponse(res, { rooms }, 200);
        } catch (error) {
            return next(error)
        }
    }


    async getMessagesAfterReload(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            console.log(JSON.parse(JSON.stringify(req.params)));
            if (!Array.isArray(id)) {
                const messages = await Chat.getMessages(id);
                return successResponse(res, { messages }, 200);
            }
        } catch (error) {
            return next(error)
        }
    }
}

export const feateresController = new Features()