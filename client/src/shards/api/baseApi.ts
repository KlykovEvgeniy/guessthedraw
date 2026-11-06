import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { type RootState } from "../../app";
import { logout, writeToken, writeUser } from "../../pages";
import type { IUser, IToken } from "../types/User";
import type { IRegisterSchema } from "../../features";
import type { ICreateRoom } from "../../widgets/CreateRoom/model/createRoomSchema";

type RegisterResponse = { data: IUser & IToken };
interface IUserStats {
    _id: string,
    username: string,
    stats: {
        score: number,
        gamesWon: number,
        gamePlayed: number,
    }
}

interface IMessage {
    username: string,
    text: string,
    id: string,
    timestamp: number,
}

interface IChat {
    success: boolean,
    message: string,
    data: {
        messages: IMessage[]
    }
}

interface IRooms {
    success: boolean,
    data: {
        rooms: (ICreateRoom & { id: string, currentPlayers: number })[]
    }
};

interface IDashBoardResponse {
    games: IUserStats[];
    score: IUserStats[];
    wins: IUserStats[];
}

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/v1.0.0',
    credentials: 'include',
    prepareHeaders: (headers, state) => {
        const token = (state.getState() as RootState).auth.access;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReuse: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh',
                method: 'get',
            },
            api,
            extraOptions
        );
        if (refreshResult.data) {
            const { data } = refreshResult.data as { data: IUser & IToken };
            api.dispatch(writeToken(data.tokens.access));
            api.dispatch(writeUser({
                username: data.username,
                avatar: data.avatar,
                email: data.email,
                id: data.id,
                isSubmitted: data.isSubmitted,
                stats: data.stats,
                googleId: data.googleId,
            }))
            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }
    return result;
}

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReuse,
    endpoints: (builder) => ({
        register: builder.mutation<RegisterResponse, IRegisterSchema>({
            query: (body) => ({
                method: 'post',
                body,
                url: '/auth/register'
            })
        }),
        refresh: builder.query<RegisterResponse, void>({
            query: () => ({
                method: 'get',
                url: '/auth/refresh',
            })
        }),
        profile: builder.query<RegisterResponse, void>({
            query: () => ({
                method: 'get',
                url: '/auth/profile',
            })
        }),
        logout: builder.mutation<{ data: { message: string } }, void>({
            query: () => ({
                method: 'post',
                url: '/auth/logout',
            })
        }),
        dashboard: builder.query<{ data: IDashBoardResponse }, void>({
            query: () => ({
                method: 'get',
                url: '/dashboard',
            })
        }),
        login: builder.mutation<RegisterResponse, Omit<IRegisterSchema, 'username'>>({
            query: (body) => ({
                url: '/auth/login',
                body,
                method: 'post',
            })
        }),
        getRooms: builder.query<IRooms, void>({
            query: () => ({
                url: '/rooms',
                method: 'get',
            })
        }),
        getChat: builder.query<IChat, { roomId: string }>({
            query: (roomId) => ({
                method: "get",
                url: `/chat/${roomId.roomId}`,
            })
        })
    }),
});

export const { useGetChatQuery, useGetRoomsQuery, useLoginMutation, useRegisterMutation, useRefreshQuery, useProfileQuery, useLogoutMutation, useDashboardQuery } = baseApi;
