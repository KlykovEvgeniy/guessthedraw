import { socket } from "../../../app"
import { useForm, type SubmitHandler } from 'react-hook-form';
import { type ICreateRoom, createRoomShema } from "../model/createRoomSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorFormMessage } from "../../../shards";
import { useNavigate } from "react-router-dom";
import styles from '../styles/styles.module.css';

export const CreateRoom = () => {
    const navigate = useNavigate()
    const { register, formState, reset, handleSubmit } = useForm<ICreateRoom>({
        resolver: zodResolver(createRoomShema),
    })
    const onSubmit: SubmitHandler<ICreateRoom> = (data) => {
        socket.emit('room:create', data, (res: { success: boolean, data: { room: { id: string } }, error: object }) => {
            if (res.success) {
                const id = res.data.room.id;
                navigate(`/rooms/game/${id}`);
            }
        });
        reset();
    }

    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <input type="number" {...register('drawTime', { valueAsNumber: true })} placeholder="draw time (seconds)" />
                {formState.errors.drawTime && <ErrorFormMessage formState={formState} name="drawTime" />}
                <input type="number" {...register('maxPlayers', { valueAsNumber: true })} placeholder="Max players" />
                {formState.errors.maxPlayers && <ErrorFormMessage formState={formState} name="maxPlayers" />}
                <input type="number" {...register('maxRounds', { valueAsNumber: true })} placeholder="Max rounds" />
                {formState.errors.maxRounds && <ErrorFormMessage formState={formState} name="maxRounds" />}
                <div className={styles.checkboxContainer}>
                    <label htmlFor="isPrivate">Private Room</label>
                    <input type="checkbox" id="isPrivate" {...register('isPrivate', { valueAsNumber: true })} />
                </div>
                {formState.errors.isPrivate && <ErrorFormMessage formState={formState} name="isPrivate" />}
                <button type="submit">Create</button>
            </form>
        </>
    )
}