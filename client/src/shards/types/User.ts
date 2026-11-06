export interface IUser {
    username: string,
    email: string,
    id: string,
    googleId?: string,
    avatar: string,
    isSubmitted: boolean,
    stats: {
        gamePlayed: number,
        gameWon: number,
        score: number,
    }
};

export interface IGameUser extends IUser {
    isReady: boolean,
    score?: number,
};

export interface IToken {
    tokens: {
        access: string,
    }
}