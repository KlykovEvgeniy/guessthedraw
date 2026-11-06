import { useForm, type SubmitHandler } from 'react-hook-form'
import type { IJoinRoom } from '../model/JoinRoom'
import { socket } from "../../../app";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from '../styles/styles.module.css';

export const JoinRoom = () => {

    const { register, formState, handleSubmit } = useForm<IJoinRoom>();
    const [error, setError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const navigate = useNavigate();
    const onSubmit: SubmitHandler<IJoinRoom> = (data) => {
        const roomId = data.id.trim().toLowerCase();
        if (!roomId) {
            setError('Enter a room ID to join.');
            return;
        }

        setError(null);
        setIsJoining(true);
        socket.emit('room:join', { roomId }, (res: {
            success: boolean;
            data?: { room: { id: string } };
            message?: string;
        }) => {
            setIsJoining(false);
            if (res.success && res.data?.room.id) {
                navigate(`/rooms/game/${res.data.room.id}`);
            } else {
                setError(res.message || 'Could not join that room. Check the ID and try again.');
            }
        });
    };

    return (
        <>
            <h1>Join Room</h1>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    autoComplete="off"
                    aria-label="Room ID"
                    aria-invalid={Boolean(formState.errors.id || error)}
                    {...register('id', { required: 'Enter a room ID.' })}
                    placeholder="Room ID"
                />
                {formState.errors.id && <span>{formState.errors.id.message}</span>}
                {error && <span role="alert">{error}</span>}
                <button type="submit" disabled={isJoining}>
                    {isJoining ? 'Joining...' : 'Join'}
                </button>
            </form>
        </>

    )
}