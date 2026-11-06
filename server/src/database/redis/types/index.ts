export enum RoomStatus {
    PENDING = 'pending',
    STARTING = 'starting',
    PLAYING = 'playing',
    FINISHED = 'finished'
}

export interface ICreateRoom {
    maxPlayers: number;
    maxRounds: number;
    drawTime: number;
    isPrivate: boolean;
}

export interface IRoom extends ICreateRoom {
    id: string;             
    ownerId: string;       
    status: RoomStatus;
    currentRound: number;
    currentWord: string;
    currentPainterId: string;
    roundEndsAt: number;
}

export interface IRoomPlayer {
    id: string;
    username: string;
    score: number;
    hasGuessed: boolean | string;
}
