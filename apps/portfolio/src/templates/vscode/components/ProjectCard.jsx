import styles from "@vscode/styles/ProjectCard.module.css";

export default function ProjectCard({ project }) {
  const img = project.image;
  return (
    <div className={styles.card}>
      {img ? <img src={img} className={styles.image} alt={project.name} /> : null}
      <div className={styles.content}>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <div className={styles.tags}>
          {(project.tags ?? []).map((tag, idx) => (
            <span key={`${tag}-${idx}`} className={tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.cta}>
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.underline}
            >
              Source
            </a>
          ) : null}
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.underline}
            >
              Demo
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
