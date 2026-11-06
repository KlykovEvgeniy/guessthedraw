import { useAppDispatch, useAppSelector } from '../../../app';
import { useGetChatQuery } from '../../../shards';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setMessages, addMessage } from '../model/chatSlice';
import { socket } from '../../../app';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formValidationSchema } from '../model/validation/form.validation';
import type { IFrom } from '../model/types/IFrom';
import type { IMessage } from '../model/types/IMessage';
import { ChatList } from '../../../entities';
import styles from '../styles/styles.module.css';

export const Chat = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const dispatch = useAppDispatch();
    const messages = useAppSelector((state) => state.chat.messages);
    const room = useAppSelector((state) => state.room.room);
    const { data, isSuccess } = useGetChatQuery({ roomId: roomId || '' });
    const [guessFeedback, setGuessFeedback] = useState('');
    const { register, handleSubmit, resetField, formState: { errors } } = useForm<IFrom>({
        resolver: zodResolver(formValidationSchema)
    });
    const onHandleSubmit: SubmitHandler<IFrom> = (data) => {
        if (room?.status === 'playing') {
            socket.emit('room:game:guess', { roomId, text: data.text }, (response: { success: boolean; correct?: boolean; message?: string }) => {
                if (response.success) {
                    setGuessFeedback(response.correct ? 'Correct!' : 'Not quite—try again.');
                    resetField('text');
                } else {
                    setGuessFeedback(response.message || 'Could not submit guess.');
                }
            });
            return;
        }
        socket.emit('room:chat:send', { roomId, text: data.text }, () => {
            resetField('text');
        });
    }
    useEffect(() => {
        const messages = data?.data?.messages;
        if (isSuccess && messages) {
            dispatch(setMessages(messages));
        }
    }, [dispatch, isSuccess, data]);

    useEffect(() => {
        const onHandleMessage = (message: IMessage) => {
            dispatch(addMessage(message));
        };
        socket.on('room:chat:send-message', onHandleMessage);
        return () => {
            socket.off('room:chat:send-message', onHandleMessage);
        };
    }, [dispatch]);

    useEffect(() => {
        const clearGuessFeedback = () => setGuessFeedback('');
        socket.on('room:round:started', clearGuessFeedback);
        return () => {
            socket.off('room:round:started', clearGuessFeedback);
        };
    }, []);

    return (
        <>
            {
                room?.id && <>
                    <h2>{room.status === 'playing' ? 'Guess the word' : 'Chat'}</h2>
                    <ChatList messages={messages} />
                    <form className={styles.form} onSubmit={handleSubmit(onHandleSubmit)}>
                        <input
                            type="text"
                            placeholder={room.status === 'playing' ? 'Enter your guess...' : 'Type your message...'}
                            {...register('text', { required: true })}
                        />
                        {errors.text && <span>{errors.text.message}</span>}
                        {guessFeedback && <span role="status">{guessFeedback}</span>}
                        <button type="submit">{room.status === 'playing' ? 'Guess' : 'Send'}</button>
                    </form>
                </>
            }
        </>
    );
};
