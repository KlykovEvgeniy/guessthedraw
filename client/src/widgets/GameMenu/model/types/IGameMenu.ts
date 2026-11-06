import { type ICreateRoom as IRoom } from "../../../CreateRoom/model/createRoomSchema";
import { type IUser as User } from "../../../../shards";

export const roomStatus = {
    PENDING: 'pending',
    STARTING: 'starting',
    PLAYING: 'playing',
    FINISHED: 'finished'
} as const;

export type roomStatus = (typeof roomStatus)[keyof typeof roomStatus];


export type Room = IRoom & {
    id: string;
    ownerId: string;
    status: roomStatus;
    currentRound: string;
    currentWord: string;
    currentPainterId: string;
    roundEndsAt: number;
    wordLength?: number;
};

export interface IUser {
    id: string;
    username: string;
    isReady: boolean,
}

export interface IRoomJoinResponse {
    success: boolean;
    message?: string;
    data?: {
        room: Room;
        player: IUser;
    };
}

export interface IGetPlayersResponse {
    success: boolean;
    message?: string;
    data?: {
        players: (IUser & Partial<User>)[];
    };
}
