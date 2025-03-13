import Link from "next/link";
import React from "react";
import { LogoIcon, LogoSmallIcon } from "@/assets";
import styles from "./NavBar.module.scss";
import { clsx } from "clsx";

interface Props extends React.PropsWithChildren {
  title?: string;
  small?: boolean;
  iconFull?: boolean;
}

export function NavBar({ title, small, iconFull, children }: Props) {
  return (
    <header className={clsx(styles.container, small && styles.small)}>
      <a
        rel="noreferrer"
        className={styles.link}
      >
        {small && !iconFull ? <LogoSmallIcon /> : <LogoIcon />}
      </a>

      {title && <h2>{title}</h2>}

      {children && <div className={styles.children}>{children}</div>}
    </header>
  );
}
