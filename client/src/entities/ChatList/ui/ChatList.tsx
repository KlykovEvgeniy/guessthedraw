import type { IChatList } from "../model/IChatList";
import type { FC } from "react";

import styles from "../styles/styles.module.css";

export const ChatList: FC<IChatList> = ({ messages }) => {
    return (
        <ul className={styles.list}>
            {
                messages.map((message) => {
                    return <li key={`${message.id + crypto.randomUUID()}`}><span>{message.username}:</span>{message.text}</li>
                })}
        </ul>
    )
}