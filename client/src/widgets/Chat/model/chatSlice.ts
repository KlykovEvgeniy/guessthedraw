import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "./types/IMessage";


interface IInitialState {
    messages: IMessage[],
}

const initialState: IInitialState = {
    messages: [],
}

export const chat = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setMessages(state, action: PayloadAction<IMessage[]>) {
            state.messages = action.payload;
        },
        addMessage(state, action: PayloadAction<IMessage>) {
            state.messages.push(action.payload);
        }
    }
});

export const { setMessages, addMessage } = chat.actions;