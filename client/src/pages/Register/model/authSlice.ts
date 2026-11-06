import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "../../../shards";
interface IState {
    access: null | string,
    user: IUser | null,
}

const initialState: IState = {
    access: null,
    user: null
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        writeToken(state, action: PayloadAction<string>) {
            state.access = action.payload;
        },
        writeUser(state, action: PayloadAction<IUser>) {
            state.user = action.payload;
        },
        logout(state) {
            state.access = null;
            state.user = null;
        }
    }
});

export const { writeToken, logout, writeUser } = authSlice.actions;


