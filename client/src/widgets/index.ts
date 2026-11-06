import { Header } from "./Header/ui/Header";
import { CreateRoom } from "./CreateRoom/ui/CreateRoom";
import { GameMenu } from "./GameMenu/ui/GameMenu";
import { Chat } from "./Chat/ui/Chat";
import { chat } from "./Chat/model/chatSlice";
import { users } from './GameMenu/model/usersSlice';
import { roomSlice } from "./GameMenu/model/roomSlice";
import { GamePanel } from "./GamePanel/ui/GamePanel";

import type { IMessage } from "./Chat/model/types/IMessage";

export type { IMessage };
export { Header, roomSlice, CreateRoom, GamePanel, GameMenu, Chat, chat, users };