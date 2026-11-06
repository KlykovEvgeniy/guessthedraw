import { RoomsList } from "../../../features"
import { JoinRoom } from "../../../shards"
import { CreateRoom } from "../../../widgets"
import styles from "../styles/rooms.module.css"


export const Rooms = () => {
    return (
        <div className={styles.roomsPage}>
            <header className={styles.roomsIntro}>
                <span>Pick a page, pick a room</span>
                <h1>Let’s play!</h1>
                <p>Create a room for your friends or join a public game.</p>
            </header>
            <div className={styles.roomActions}>
                <section className={styles.actionCard}>
                    <h2>Create a room</h2>
                    <CreateRoom />
                </section>
                <section className={styles.actionCard}>
                    <JoinRoom />
                </section>
            </div>
            <section className={styles.publicRooms}>
                <RoomsList />
            </section>
        </div>
    )
}