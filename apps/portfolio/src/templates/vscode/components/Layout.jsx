"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Titlebar from "./Titlebar";
import Sidebar from "./Sidebar";
import Explorer from "./Explorer";
import Bottombar from "./Bottombar";
import Tabsbar from "./Tabsbar";
import styles from "@vscode/styles/Layout.module.css";

export default function Layout({ children, titlebarTitle }) {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.getElementById("main-editor");
    if (main) main.scrollTop = 0;
  }, [pathname]);
  return (
    <>
      <Titlebar title={titlebarTitle} />
      <div className={styles.main}>
        <Sidebar />
        <Explorer />
        <div style={{ width: "100%" }}>
          <Tabsbar />
          <main id="main-editor" className={styles.content}>
            {children}
          </main>
        </div>
      </div>
      <Bottombar />
    </>
  );
}
