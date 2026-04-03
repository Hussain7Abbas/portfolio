import Head from 'next/head';

const CustomHead = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="description"
        content="Hussain Abbas is an avid full stack web developer building websites and applications you'd love to use"
      />
      <meta
        name="keywords"
        content="hussain abbas, hussain, abbas, web developer portfolio, hussain web developer, hussain developer, mern stack, hussain abbas portfolio, vscode-portfolio"
      />
      <meta property="og:title" content="Hussain Abbas's Portfolio" />
      <meta
        property="og:description"
        content="A full-stack developer building websites that you'd like to use."
      />
      <meta property="og:image" content="https://i.imgur.com/bEXnlU9.png" />
      <meta property="og:url" content="https://hussain7abbas.vercel.app" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  );
};

export default CustomHead;

CustomHead.defaultProps = {
  title: 'Hussain Abbas',
};
