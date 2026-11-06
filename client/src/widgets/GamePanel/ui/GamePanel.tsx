import { GameMenu } from "../../GameMenu/ui/GameMenu"
import { Chat } from "../../Chat/ui/Chat"
import type { IGamePanel } from "../model/GamePanel"
import type { FC } from "react"
import { Loading } from "../../Loading/ui/Loading"
import { DrawMenu } from "../../DrawMenu/ui/DrawMenu"

export const GamePanel: FC<IGamePanel> = ({ isPending }) => {
    return (
        <>
            {
                isPending === 'pending' && (
                    <>
                        <GameMenu />
                        <Chat />
                    </>
                )
            }
            {
                isPending === 'starting' && (
                    <Loading />
                )
            }
            {isPending === 'playing' && <DrawMenu />}
            {isPending === 'finished' && <h2>Game finished!</h2>}
        </>
    )
}