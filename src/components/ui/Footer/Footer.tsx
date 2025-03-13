import styles from "./Footer.module.scss";
import { DiscordIcon, DtelecomIcon, TwitterIcon } from "@/assets";
import React from "react";
import { isMobileBrowser } from "@dtelecom/components-core";

export const Footer = () => {
  const isMobile = React.useMemo(() => isMobileBrowser(), []);


  return (
    <div className={styles.container}>
      <div>
        Powered by
        <DtelecomIcon />
      </div>
    </div>
  );
};
