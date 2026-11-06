import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authSlice } from '../../pages';
import { baseApi } from '../../shards';
import { chat, users, roomSlice } from '../../widgets';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        chat: chat.reducer,
        users: users.reducer,
        room: roomSlice.reducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
