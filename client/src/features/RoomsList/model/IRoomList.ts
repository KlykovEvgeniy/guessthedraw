type RoomStatus = "PENDING" | "ACTIVE" | "FINISHED";

export interface IGetPublicRoomsResponse {
    success: boolean;
    data?: {
        rooms: IRoom[];
    };
}
export interface IRoom {
    id: string;
    ownerId: string;
    status: RoomStatus;
    maxPlayers: number;
    maxRounds: number;
    drawTime: number;
    isPrivate: boolean;
    currentRound: number;
    currentWord?: string;
    currentPainterId?: string;
}

