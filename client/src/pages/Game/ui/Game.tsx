import { useAppSelector } from "../../../app";
import { useEffect, useLayoutEffect, useState } from "react";
import { GamePanel } from "../../../widgets";
import { socket } from "../../../app";
import type { roomStatus } from "../../../widgets/GameMenu/model/types/IGameMenu";
import { Navigate } from "react-router-dom";
import styles from "../styles/game.module.css";

const isReloadedGameRoute =
    /^\/rooms\/game\/[^/]+$/.test(window.location.pathname) &&
    performance.getEntriesByType("navigation").some(
        (entry) => entry instanceof PerformanceNavigationTiming && entry.type === "reload"
    );
let hasRedirectedReloadedGameRoute = false;

export const Game = () => {
    const room = useAppSelector((state) => state.room.room);
    const [isPending, setPending] = useState<roomStatus>('pending');
    const shouldRedirectToRooms = isReloadedGameRoute && !hasRedirectedReloadedGameRoute;

    useEffect(() => {
        (() => {
            if (room) {
                setPending(room.status);
            }
        })();
    }, [room]);
    useEffect(() => {
        const handleGameStart = () => {
            setPending('starting');
        };
        const handleGamePlaying = () => {
            setPending('playing');
        };
        const handleGameFinished = () => {
            setPending('finished');
        };
        socket.on('room:game:started', handleGameStart);
        socket.on('room:game:playings', handleGamePlaying);
        socket.on('room:game:finished', handleGameFinished);
        return () => {
            socket.off('room:game:started', handleGameStart);
            socket.off('room:game:playings', handleGamePlaying);
            socket.off('room:game:finished', handleGameFinished);
        };
    }, []);

    useLayoutEffect(() => {
        if (shouldRedirectToRooms) {
            hasRedirectedReloadedGameRoute = true;
        }
    }, [shouldRedirectToRooms]);

    if (shouldRedirectToRooms) {
        return <Navigate to="/rooms" replace />;
    }

    return (
        <div className={styles.gamePage}>
            <h1>Room: {room ? room.id : 'Loading...'}</h1>
            <GamePanel isPending={isPending} />
        </div>
    );
};
