import { Outlet } from "react-router-dom";
import { Header } from "../../widgets";
import { useProfileQuery, useRefreshQuery } from "../../shards";
import { useAppDispatch } from "../store/store";
import { useEffect } from "react";
import { writeUser, writeToken } from "../../pages";
import { socket } from "../providers/io";
import "../styles/globalStyles.css";

export const Layout = () => {
    const dispatch = useAppDispatch();
    const { data, isSuccess } = useProfileQuery();
    const ref = useRefreshQuery();
    useEffect(() => {
        if (isSuccess && data) {
            dispatch(writeUser(data.data));
        }

        if (ref.isSuccess && ref.data?.data?.tokens?.access) {
            const accessToken = ref.data.data.tokens.access;
            dispatch(writeToken(accessToken));

            socket.auth = { token: accessToken };
            if (!socket.connected) {
                socket.connect();
            }
        }
        else if (isSuccess && data) {
            socket.auth = {};

            if (!socket.connected) {
                socket.connect();
            }
        }

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
        };
    }, [data, dispatch, isSuccess, ref]);

    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
        </>
    );
};
