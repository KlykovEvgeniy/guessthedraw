import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Room as IRoom } from "./types/IGameMenu";


interface IInitalState {
    room: IRoom | null,
}

const initialState: IInitalState = {
    room: null,
}

export const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
        setRoom(state, action: PayloadAction<IRoom>) {
            state.room = action.payload;
        }
    }
});

export const { setRoom } = roomSlice.actions;