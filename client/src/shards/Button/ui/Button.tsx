import type { FC } from "react";
import type { IButton } from "../model/Button";

export const Button: FC<IButton> = ({onClick, title, type}) => {
    return <button onClick={onClick} type={type}>{title}</button>
}