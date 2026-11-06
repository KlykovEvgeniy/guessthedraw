import { Logo } from "../../../shards";
import styles from '../styles/header.module.css';
import { Nav } from "../../Nav/ui/Nav";

export const Header = () => {
    return (
        <>
            <header className={styles.header}>
                <Logo />
                <Nav />
            </header>
        </>
    );
};
