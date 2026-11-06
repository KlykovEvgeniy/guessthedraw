import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Logout, NavItem } from "../../../shards";
import styles from '../styles/nav.module.css';
import { useAppSelector } from "../../../app";

export const Nav = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    return (
        <nav className={`${styles.nav} ${isOpen ? styles.navOpen : ''}`} aria-label="Main navigation">
            <button
                type="button"
                className={styles.menuToggle}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="primary-navigation"
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className={styles.menuIcon} aria-hidden="true" />
            </button>
            <ul id="primary-navigation" onClick={() => setIsOpen(false)}>
                <NavItem name="Home" to="/" />
                {
                    !user &&
                    <>
                        <NavItem name="Register" to="/register" />
                        <NavItem name="Login" to="/login" />
                    </>
                }
                {
                    user && <>
                        <NavItem name="Dashboard" to="/dashboard" />
                        <NavItem name="Rooms" to="/rooms"/>
                        <li>
                            <Logout />
                        </li>
                    </>
                }

            </ul>
        </nav>
    )
};