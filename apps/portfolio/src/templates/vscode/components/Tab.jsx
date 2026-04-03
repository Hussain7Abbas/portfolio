"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { usePortfolioBase } from "../base-context";
import styles from "@vscode/styles/Tab.module.css";

export default function Tab({ icon, filename, path }) {
  const pathname = usePathname();
  const { base } = usePortfolioBase();
  const href = path === "/" ? base : `${base}${path}`;
  const active =
    pathname === href || (path === "/" && (pathname === base || pathname === `${base}/`));

  return (
    <Link href={href}>
      <div className={`${styles.tab} ${active ? styles.active : ""}`}>
        <Image src={icon} alt={filename} height={18} width={18} />
        <p>{filename}</p>
      </div>
    </Link>
  );
}
