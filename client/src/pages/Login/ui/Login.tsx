import { LoginWithEmail } from '../../../features'
import styles from '../styles/login.module.css'

export const Login = () => {
    return (
        <div className={styles.login}>
            <LoginWithEmail />
        </div>
    )
}