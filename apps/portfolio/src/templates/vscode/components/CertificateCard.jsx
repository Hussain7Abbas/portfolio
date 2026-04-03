import Image from "next/image";
import styles from "@vscode/styles/CertificateCard.module.css";

export default function CertificateCard({ certificate }) {
  const body = (
    <>
      {certificate.image ? (
        <Image
          src={certificate.image}
          alt={certificate.name}
          width={200}
          height={100}
          className={styles.certImage}
          unoptimized
        />
      ) : null}
      <div className={styles.content}>
        <h3 className={styles.name}>{certificate.name}</h3>
        <p>{certificate.description}</p>
      </div>
    </>
  );
  return (
    <div className={styles.CertificateCard}>
      {certificate.url ? (
        <a
          href={certificate.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.container}
        >
          {body}
        </a>
      ) : (
        <div className={styles.container}>{body}</div>
      )}
    </div>
  );
}
