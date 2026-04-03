import ProjectCard from '../components/ProjectCard';
import { getProjects } from './api/projects';
import styles from '/styles/ProjectsPage.module.css';
import BlurFade from '/components/magicui/blur-fade';

const ProjectsPage = ({ projects }) => {
  return (
    <>
      <BlurFade inView>
        <h3 className='text-2xl mb-3'>Stuff I've Built So Far</h3>
      </BlurFade>
      <div className={styles.container}>
        {projects.map((project, idx) => (
          <BlurFade delay={0.25 + idx * 0.05} inView key={project.id}>
            <ProjectCard project={project} />
          </BlurFade>
        ))}
      </div>
    </>
  );
};

export async function getStaticProps() {
  const projects = getProjects();

  return {
    props: { title: 'Projects', projects },
  };
}

export default ProjectsPage;
