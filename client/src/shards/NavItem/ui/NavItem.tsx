import { NavLink } from "react-router-dom";
import type { INavItem } from "../model/NavItem.props";
import type { FC } from "react";

import styles from '../styles/navitem.module.css';

export const NavItem: FC<INavItem> = ({ name, to }) => {
    const className = ({ isActive }: { isActive: boolean }) => {
        return isActive 
            ? `${styles.nav__link} ${styles.nav__link_active}` 
            : styles.nav__link;
    }

    return (
        <li>
            <NavLink to={to} className={className}>
                {name}
            </NavLink>
        </li>
    );
};
