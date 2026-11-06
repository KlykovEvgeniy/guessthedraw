import { useNavigate } from 'react-router-dom';
import { socket } from '../../../app';

export const QuiteRoom = ({ roomId }: { roomId: string }) => {
    const navigate = useNavigate();

    return (
        <button onClick={() => {
            socket.emit('room:leave', { roomId }, () => { });
            navigate('/rooms');
        }}>Leave Room</button>
    )
};