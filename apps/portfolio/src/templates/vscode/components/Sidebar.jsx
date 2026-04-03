"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FilesIcon from "./icons/FilesIcon";
import GithubIcon from "./icons/GithubIcon";
import CodeIcon from "./icons/CodeIcon";
import PencilIcon from "./icons/PencilIcon";
import MailIcon from "./icons/MailIcon";
import AccountIcon from "./icons/AccountIcon";
import SettingsIcon from "./icons/SettingsIcon";
import { usePortfolioBase } from "../base-context";
import styles from "@vscode/styles/Sidebar.module.css";

const sidebarTopItems = [
  { Icon: FilesIcon, path: "/" },
  { Icon: GithubIcon, path: "/github" },
  { Icon: CodeIcon, path: "/projects" },
  { Icon: PencilIcon, path: "/certificates" },
  { Icon: MailIcon, path: "/contact" },
];

const sidebarBottomItems = [
  { Icon: AccountIcon, path: "/about" },
  { Icon: SettingsIcon, path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { base } = usePortfolioBase();

  function hrefFor(path) {
    return path === "/" ? base : `${base}${path}`;
  }

  function isActive(path) {
    const target = hrefFor(path);
    return pathname === target || pathname === `${target}/`;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        {sidebarTopItems.map(({ Icon, path }) => (
          <Link href={hrefFor(path)} key={path}>
            <div
              className={`${styles.iconContainer} ${isActive(path) ? styles.active : ""}`}
            >
              <Icon
                fill={isActive(path) ? "rgb(225, 228, 232)" : "rgb(106, 115, 125)"}
                className={styles.icon}
              />
            </div>
          </Link>
        ))}
      </div>
      <div className={styles.sidebarBottom}>
        {sidebarBottomItems.map(({ Icon, path }) => (
          <div className={styles.iconContainer} key={path}>
            <Link href={hrefFor(path)}>
              <Icon
                fill={isActive(path) ? "rgb(225, 228, 232)" : "rgb(106, 115, 125)"}
                className={styles.icon}
              />
            </Link>
          </div>
        ))}
      </div>
    </aside>
  );
}
