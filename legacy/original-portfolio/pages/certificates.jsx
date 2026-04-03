import CertificateCard from '../components/CertificateCard';
import { getCertificates } from './api/certificates';
import styles from '/styles/CertificatesPage.module.css';
import BlurFade from '/components/magicui/blur-fade';

const CertificatesPage = ({ certificates }) => {
  return (
    <>
      <BlurFade inView>
        <h3 className='text-2xl mb-3'>Certificates I Earned So Far</h3>
      </BlurFade>
      <div className={styles.container}>
        {certificates.map((certificate) => (
          <CertificateCard key={certificate.id} certificate={certificate} />
        ))}
      </div>
    </>
  );
};

export async function getStaticProps() {
  const certificates = getCertificates();

  return {
    props: { title: 'Certificates', certificates },
  };
}

export default CertificatesPage;
