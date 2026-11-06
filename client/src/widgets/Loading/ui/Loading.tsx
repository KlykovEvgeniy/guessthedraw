import { useEffect } from 'react';
import { socket } from '../../../app';
import { useParams } from 'react-router-dom';

export const Loading = () => {
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (!roomId) return;
    socket.emit('room:game:playing', { roomId }, () => {});
  }, [roomId]);

  return <h2>Starting...</h2>;
};
