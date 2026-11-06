import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../../app';
import type { IRoomJoinResponse, IGetPlayersResponse } from '../model/types/IGameMenu';
import { setPlayers } from '../model/usersSlice';
import { useAppSelector, useAppDispatch } from '../../../app';
import { QuiteRoom, StartGame, type IUser } from '../../../shards';
import { setRoom } from '../model/roomSlice';

export const GameMenu = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const players = useAppSelector((state) => state.users) || [];
    const room = useAppSelector((state) => state.room.room);
    const user = useAppSelector((state) => state.auth.user)
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
                dispatch(setRoom(response.data.room));
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
        <div className="game-screen">
            {room && <p>Max players: {room.maxPlayers}</p>}
            {room?.id && (
                <>
                    <ul>
                        {players.users.map((player) => (
                            <li key={player.id}>
                                {player.username}
                            </li>
                        ))}
                    </ul>
                    <QuiteRoom roomId={roomId || ''} />
                    {(room.ownerId === (user as IUser & { _id: string })?._id || room.ownerId === user?.googleId) ? <StartGame disabled={false} roomId={roomId || ''} /> : <StartGame disabled={true} roomId={roomId || ''} />}
                </>
            )
            }
        </div>
    );
};
