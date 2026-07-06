import StarIcon from "./icons/StarIcon";
import GithubIcon from "./icons/GithubIcon";
import styles from "@vscode/styles/RepoCard.module.css";

export default function RepoCard({ repo }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{repo.name}</h3>
        <p>{repo.description}</p>
      </div>
      <div className={styles.stats}>
        <div>
          {repo.language ? <span className={styles.language}>{repo.language}</span> : null}
        </div>
        <div>
          <div>
            <StarIcon className={styles.icon} /> {repo.stars ?? 0}
          </div>
        </div>
        <div>
          <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
            <GithubIcon height={20} width={20} className={styles.icon} />
          </a>
        </div>
      </div>
    </div>
  );
}
