import styles from "@vscode/styles/EventCard.module.css";

export default function EventCard({ event }) {
  return (
    <div className={styles.card}>
      {event.image ? (
        <img src={event.image} className={styles.image} alt={event.name} />
      ) : null}
      <div className={styles.content}>
        <h3>{event.name}</h3>
        <p>{event.description}</p>
        <div className={styles.cta}>
          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.underline}
            >
              Link
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
