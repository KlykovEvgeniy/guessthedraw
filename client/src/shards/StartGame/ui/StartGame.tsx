import type { FC } from 'react';
import { socket } from '../../../app';
import type { IStartGame } from '../model/StartGame';

export const StartGame: FC<IStartGame> = ({ roomId, disabled }) => {
  const onClick = () => {
    socket.emit('room:game:start', { roomId }, (res: { success: boolean; message: string }) => {
      if (res && res.success) {
        console.log(res.message);
      }
    });
  };

  return (
    <button disabled={disabled} type="button" onClick={onClick}>
      Start Game!
    </button>
  );
};
