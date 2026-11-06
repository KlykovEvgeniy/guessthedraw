import styles from './styles/error.module.css'

export const NotFound = () => {
    return (
        <div className={styles['not-found']}>
            <h1>404. Page not found</h1>
        </div>
    )
}