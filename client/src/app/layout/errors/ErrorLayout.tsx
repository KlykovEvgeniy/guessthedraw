import { useRouteError } from "react-router-dom"
import styles from './styles/error.module.css'

export const Error = () => {
    const error = useRouteError();
    return (
        <div className={styles.error}>
            <h1>{(error as Error & { status: number }).status}.{(error as Error).message}</h1>
        </div>
    )
}