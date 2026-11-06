import { RegisterWithEmailForm } from "../../../features"
import styles from '../styles/register.module.css'

export const Register = () => {
    return (
        <div className={styles.register}>
            <RegisterWithEmailForm />
        </div>
    )
}