"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ChevronRight from "./icons/ChevronRight";
import { usePortfolioBase } from "../base-context";
import styles from "@vscode/styles/Explorer.module.css";

const explorerItems = [
  { name: "home.jsx", path: "/", icon: "react_icon.svg" },
  { name: "about.html", path: "/about", icon: "html_icon.svg" },
  { name: "contact.css", path: "/contact", icon: "css_icon.svg" },
  { name: "projects.js", path: "/projects", icon: "js_icon.svg" },
  { name: "certificates.json", path: "/certificates", icon: "json_icon.svg" },
  { name: "github.md", path: "/github", icon: "markdown_icon.svg" },
];

export default function Explorer() {
  const [portfolioOpen, setPortfolioOpen] = useState(true);
  const { base } = usePortfolioBase();

  function hrefFor(path) {
    return path === "/" ? base : `${base}${path}`;
  }

  return (
    <div className={styles.explorer}>
      <p className={styles.title}>Explorer</p>
      <div>
        <input
          type="checkbox"
          className={styles.checkbox}
          id="portfolio-checkbox"
          checked={portfolioOpen}
          onChange={() => setPortfolioOpen(!portfolioOpen)}
        />
        <label htmlFor="portfolio-checkbox" className={styles.heading}>
          <ChevronRight
            className={styles.chevron}
            style={portfolioOpen ? { transform: "rotate(90deg)" } : {}}
          />
          Portfolio
        </label>
        <div
          className={styles.files}
          style={portfolioOpen ? { display: "block" } : { display: "none" }}
        >
          {explorerItems.map((item) => (
            <Link href={hrefFor(item.path)} key={item.name}>
              <div className={styles.file}>
                <Image src={`/${item.icon}`} alt={item.name} height={18} width={18} />{" "}
                <p>{item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
