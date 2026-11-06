import styles from '../styles/style.module.css';
import { useGetRoomsQuery } from '../../../shards';
import { Link } from 'react-router-dom'; 

export const RoomsList = () => {
    const { data, isLoading, refetch } = useGetRoomsQuery();

    const handleRefresh = () => {
        refetch(); 
    };

    return (
        <>
            <div className={styles.rooms}>
                <h1>Public Rooms</h1>
                <button onClick={handleRefresh} type='button'>Refresh</button>
            </div>

            {data?.data.rooms.map((room) => (
                <div className={styles.item} key={room.id}>
                    <p>Room ID: {room.id} <span>({room.currentPlayers}/{room.maxPlayers})</span></p>
                    <Link className={styles.joinButton} to={`/rooms/game/${room.id}`}>
                        Join Room
                    </Link>
                </div>
            ))}

            {data?.data.rooms.length === 0 && <h3>No rooms</h3>}
            {isLoading && <h3>Loading...</h3>}
        </>
    );
};
