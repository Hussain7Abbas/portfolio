import { getEvents } from './api/events';
import EventCard from '/components/EventCard';
import BlurFade from '/components/magicui/blur-fade';
import styles from '/styles/AboutPage.module.css';

const AboutPage = ({ events }) => {
  return (
    <div className='flex flex-row-reverse max-lg:flex-col'>
      <img
        src='/personal_photo.webp'
        className='transition-all lg:flex-shrink-[1] h-[40rem] object-top rounded-lg object-cover max-lg:self-center max-lg:w-[15rem] max-lg:h-[15rem] max-lg:rounded-full'
        alt='Personal Photo'
      />
      <div className='lg:flex-shrink-[2] lg:me-7 max-lg:mt-2'>
        <BlurFade inView>
          <h3 className='text-3xl mb-3 mt-3 lg:mt-0'>A Little Bit About Me</h3>
        </BlurFade>
        <p>Full Stack Developer and Team Leader with 5+ years of experience in software development and project management. Skilled in leading teams to deliver high-quality events, enhancing codebases, Proficient in frontend (React.js) and backend (Node.js) development, and experienced in mentoring developers and UX/UI designers. Strong in Agile methodologies, delivering solutions that drive business success.</p>
        <BlurFade inView>
          <h3 className='text-3xl mb-3 mt-7'>Events I Made</h3>
        </BlurFade>
        <div className={styles.container}>
          {events.map((event, idx) => (
            <BlurFade delay={0.25 + idx * 0.05} inView key={event.id}>
              <EventCard event={event} />
            </BlurFade>
          ))}
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  const events = getEvents();

  return {
    props: { title: 'About', events },
  };
}

export default AboutPage;
