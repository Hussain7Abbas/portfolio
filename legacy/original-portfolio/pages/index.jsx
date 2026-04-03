import Link from 'next/link';
import Illustration from '../components/Illustration';
import styles from '/styles/HomePage.module.css';
import BlurFade from '../components/magicui/blur-fade';

export default function HomePage() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.background}>
          <h1>I BUILD</h1>
          <h1>WEBSITES</h1>
        </div>
        <div className={styles.foreground}>
          <div className={styles.content}>
            <BlurFade inView>
              <h1 className={styles.name}>Hussain Abbas</h1>
            </BlurFade>
            <h6 className={styles.bio}>Full Stack Web Developer</h6>
            <a href="https://drive.google.com/file/d/1cAo-ei5AJRpq7Cdri2Xt8pDIRTlz9tsd/view?usp=sharing" rel="noopener noreferrer" target="_blank">
              <button className={styles.button}>Resume</button>
            </a>
            <Link href="/contact">
              <button className={styles.outlined}>Contact Me</button>
            </Link>
          </div>
          <Illustration className={styles.illustration} />
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: { title: 'Home' },
  };
}
