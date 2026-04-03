import styles from "@vscode/styles/ContactCode.module.css";

export default function ContactCode({ items }) {
  const list = items ?? [];
  return (
    <div className={styles.code}>
      <p className={styles.line}>
        <span className={styles.className}>.socials</span> &#123;
      </p>
      {list.map((item) => (
        <p className={styles.line} key={item.social}>
          &nbsp;&nbsp;&nbsp;{item.social}:{" "}
          <a href={item.href} target="_blank" rel="noopener noreferrer">
            {item.link}
          </a>
          ;
        </p>
      ))}
      <p className={styles.line}>&#125;</p>
    </div>
  );
}
