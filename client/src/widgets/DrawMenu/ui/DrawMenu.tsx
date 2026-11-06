import { useNavigate, useParams } from "react-router-dom";
import { socket, useAppDispatch, useAppSelector } from "../../../app";
import type { IGetPlayersResponse, IRoomJoinResponse, Room } from "../../GameMenu/model/types/IGameMenu";
import { setPlayers } from "../../GameMenu/model/usersSlice";
import { setRoom } from "../../GameMenu/model/roomSlice";
import { useEffect, useRef, useState } from "react";
import { Chat } from "../../Chat/ui/Chat";
import { PaintBoard } from "../../../features";
import styles from "../styles/drawMenu.module.css";

const isCurrentPlayerPainter = (playerId: string | null, painterId: string | undefined) =>
    Boolean(playerId && painterId && playerId === String(painterId));

export const DrawMenu = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [isPainter, setPainter] = useState<boolean>(false);
    const [secretWord, setSecretWord] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [roundMessage, setRoundMessage] = useState('');
    const room = useAppSelector(state => state.room.room);
    const players = useAppSelector(state => state.users.users);
    const round = room?.currentRound;
    const wordLength = room?.wordLength ?? secretWord.length;
    const timePercent = room?.drawTime
        ? Math.min(100, (secondsLeft / room.drawTime) * 100)
        : 0;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const requestedRoomId = useRef<string | null>(null);
    const playerId = useRef<string | null>(null);
    const painterId = useRef<string | null>(null);

    useEffect(() => {
        const updateTimeLeft = () => {
            const remaining = room?.roundEndsAt ? room.roundEndsAt - Date.now() : 0;
            setSecondsLeft(Math.max(0, Math.ceil(remaining / 1000)));
        };
        updateTimeLeft();
        const timer = window.setInterval(updateTimeLeft, 250);
        return () => window.clearInterval(timer);
    }, [room?.roundEndsAt]);

    useEffect(() => {
        if (
            !roomId ||
            room?.status !== 'playing' ||
            Number(round) !== 0 ||
            requestedRoomId.current === roomId
        ) {
            return;
        }

        requestedRoomId.current = roomId;
        socket.emit('room:round:generate', { roomId }, (res: { success: boolean, room?: Room }) => {
            if (res.success && res.room) {
                dispatch(setRoom(res.room));
                painterId.current = res.room.currentPainterId;
                setPainter(isCurrentPlayerPainter(playerId.current, painterId.current));
                setRoundMessage('');
            } else if (!res.success) {
                requestedRoomId.current = null;
            }
        });
    }, [room, roomId, round, dispatch]);

    useEffect(() => {
        const handleRoundStarted = (updatedRoom: Room) => {
            dispatch(setRoom(updatedRoom));
            painterId.current = updatedRoom.currentPainterId;
            setPainter(isCurrentPlayerPainter(playerId.current, painterId.current));
            setSecretWord('');
            setRoundMessage('');
        };
        const handlePrivateWord = (word: string) => {
            setSecretWord(word);
        };
        const handleRoundEnded = ({ word }: { word: string }) => {
            setRoundMessage(`Round over! The word was ${word}.`);
        };
        const handleGuessed = () => {
            socket.emit('room:get-players', { roomId }, (playersResponse: IGetPlayersResponse) => {
                if (playersResponse.success && playersResponse.data) {
                    dispatch(setPlayers(playersResponse.data.players as []));
                }
            });
        };
        socket.on('room:round:started', handleRoundStarted);
        socket.on('room:game:word', handlePrivateWord);
        socket.on('room:game:round-ended', handleRoundEnded);
        socket.on('room:game:guessed', handleGuessed);
        return () => {
            socket.off('room:round:started', handleRoundStarted);
            socket.off('room:game:word', handlePrivateWord);
            socket.off('room:game:round-ended', handleRoundEnded);
            socket.off('room:game:guessed', handleGuessed);
        };
    }, [dispatch, roomId]);
    useEffect(() => {
        if (!roomId) return;
        const fetchPlayers = () => {
            socket.emit('room:get-players', { roomId }, (playersResponse: IGetPlayersResponse) => {
                if (playersResponse.success && playersResponse.data) {
                    dispatch(setPlayers(playersResponse.data.players as []));
                }
            });
        };
        socket.emit('room:join', { roomId }, (response: IRoomJoinResponse) => {
            if (response.success && response.data) {
                playerId.current = response.data.player.id;
                painterId.current = response.data.room.currentPainterId || painterId.current;
                dispatch(setRoom(response.data.room));
                setPainter(isCurrentPlayerPainter(playerId.current, painterId.current ?? undefined));
                fetchPlayers();
            } else {
                navigate('/rooms');
            }
        });
        const handlePlayerJoined = () => {
            fetchPlayers();
        };
        const handlePlayerLeft = () => {
            fetchPlayers();
        };
        socket.on('player:joined', handlePlayerJoined);
        socket.on('player:left', handlePlayerLeft);
        return () => {
            socket.off('player:joined', handlePlayerJoined);
            socket.off('player:left', handlePlayerLeft);
            if (window.location.pathname !== `/rooms/game/${roomId}`) {
                socket.emit('room:leave', { roomId }, () => { });
            }
        };
    }, [roomId, navigate, dispatch]);

    return (
        <div className={styles.drawMenu}>
            <section className={styles.roundInfo} aria-label="Round timer and word hint">
                <div className={styles.roundHeading}>
                    <span className={styles.roundNumber}>Round {round} of {room?.maxRounds}</span>
                    <span className={`${styles.timer} ${secondsLeft <= 10 ? styles.timerUrgent : ''}`}>
                        <span className={styles.timerIcon} aria-hidden="true">◷</span>
                        {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                    </span>
                </div>
                <div
                    className={styles.timerTrack}
                    role="progressbar"
                    aria-label="Time remaining"
                    aria-valuemin={0}
                    aria-valuemax={room?.drawTime ?? 0}
                    aria-valuenow={secondsLeft}
                >
                    <span
                        className={`${styles.timerProgress} ${secondsLeft <= 10 ? styles.timerProgressUrgent : ''}`}
                        style={{ width: `${timePercent}%` }}
                    />
                </div>
                {isPainter && secretWord ? (
                    <p className={styles.wordPrompt}>Your word: <strong>{secretWord}</strong></p>
                ) : (
                    <div
                        className={styles.wordHint}
                        aria-label={wordLength > 0 ? `The word has ${wordLength} letters` : 'Waiting for the word'}
                    >
                        <span className={styles.wordHintLabel}>Word:</span>
                        {wordLength > 0 ? (
                            <div className={styles.letterSlots} aria-hidden="true">
                                {Array.from({ length: wordLength }, (_, index) => (
                                    <span className={styles.letterSlot} key={index}>_</span>
                                ))}
                            </div>
                        ) : (
                            <span className={styles.waitingWord}>Waiting for the word…</span>
                        )}
                    </div>
                )}
            </section>
            {roundMessage && <p className={styles.roundMessage} role="status">{roundMessage}</p>}
            <div className={styles.gameColumns}>
                <div className={styles.canvasColumn}>
                    <PaintBoard roomId={roomId || ''} isPainter={isPainter} />
                </div>
                <div className={styles.sideColumn}>
                    <h3 className={styles.scoresHeading}>Scores</h3>
                    <ul className={styles.scoreList}>
                        {players.map((player) => (
                            <li key={player.id}>{player.username}: {player.score ?? 0}</li>
                        ))}
                    </ul>
                    <Chat />
                </div>
            </div>
        </div>
    );
};
