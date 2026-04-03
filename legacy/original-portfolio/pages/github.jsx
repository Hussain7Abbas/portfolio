import Image from 'next/image';
import GitHubCalendar from 'react-github-calendar';
import RepoCard from '../components/RepoCard';
import styles from '/styles/GithubPage.module.css';
import BlurFade from '/components/magicui/blur-fade';

const GithubPage = ({ repos, user, error }) => {
  const theme = {
    level0: '#161B22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353',
  };

  if (error) {
    return (
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/Hussain7Abbas">Hussain Abbas</a>
    );
  }

  return (
    <>
      <div className={styles.user}>
        <BlurFade>
          <div className={styles.user_header}>
            <a href={user.html_url} target="_blank" rel="noopener noreferrer" className={styles.userProfile}>
              <Image
                src={user.avatar_url}
                className={styles.avatar}
                alt={user.login}
                width={50}
                height={50}
              />
              <h3 className={styles.username}>{user.login}</h3>
            </a>
            <div>
              <h3>{user.public_repos} repos</h3>
            </div>
            <div>
              <h3>{user.followers} followers</h3>
            </div>
          </div>
        </BlurFade>
      </div>
      <div className={styles.container}>
        {repos.map((repo, idx) => (
          <BlurFade delay={0.25 + idx * 0.05} key={repo.id}>
            <RepoCard repo={repo} />
          </BlurFade>
        ))}
      </div>
      <div className={styles.contributions}>
        <GitHubCalendar
          username={process.env.NEXT_PUBLIC_GITHUB_USERNAME}
          theme={theme}
          hideColorLegend
          hideMonthLabels
        />
      </div>
    </>
  );
};

export async function getStaticProps() {
  let error = false;
  const userRes = await fetch(
    `https://api.github.com/users/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_KEY}`,
      },
    }
  );
  const user = await userRes.json();
  if (user.status) {
    error = true;
  }

  const repoRes = await fetch(
    `https://api.github.com/users/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}/repos?per_page=100`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_API_KEY}`,
      },
    }
  );
  let repos = await repoRes.json();
  if (repos.status) {
    error = true;
  } else {
    repos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count);
  }

  return {
    props: { title: 'GitHub', repos, user, error },
    revalidate: 10,
  };
}

export default GithubPage;
