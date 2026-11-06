import { useDashboardQuery } from "../../../shards";
import styles from "../styles/dashboard.module.css";

export const Dashboard = () => {
    const { data, isLoading, isError } = useDashboardQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    return (
        <div className={styles.dashboard}>
            <header className={styles.heading}>
                <span>THE DOODLE LEADERBOARD</span>
                <h1>Top players</h1>
                <p>Every good guess earns its place on the page.</p>
            </header>
            {isLoading && <p className={styles.status}>Loading the leaderboard...</p>}
            {isError && <p className={styles.status} role="alert">Could not load the dashboard.</p>}
            {!isLoading && !isError && (
                <ol className={styles.leaderboard}>
                    {data?.data?.score.map((item, index) => (
                        <li key={item._id} className={styles.player}>
                            <span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span>
                            <span className={styles.username}>{item.username}</span>
                            <span className={styles.points}>{item.stats.score} pts</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}