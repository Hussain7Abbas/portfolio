import Image from 'next/image';
import styles from '/styles/CertificateCard.module.css';

const CertificateCard = ({ certificate }) => {
  return (
    <div
      className={styles.CertificateCard}
    >
      <a
        href={certificate.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.container}
      >
        <Image
          src={certificate.image}
          alt={certificate.name}
          width={200}
          height={100}
          className={styles.certImage}
        />
        <div className={styles.content}>
          <h3 className={styles.name}>{certificate.name}</h3>
          <p>{certificate.description}</p>
        </div>

      </a>
    </div>
  );
};

export default CertificateCard;
