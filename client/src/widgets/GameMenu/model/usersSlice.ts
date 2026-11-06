import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IGameUser } from "../../../shards";

interface IInitailState {
    users: IGameUser[],
}

const initialState: IInitailState = {
    users: [],
};

export const users = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setPlayers(state, action: PayloadAction<IGameUser[]>) {
            state.users = action.payload;
        }
    }
});

export const { setPlayers } = users.actions;