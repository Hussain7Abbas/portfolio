import { useEffect, useState } from "react";
import Layout from "/components/Layout";
import Head from "/components/Head";
import "/styles/globals.css";
import "/styles/themes.css";

function MyApp({ Component, pageProps }) {

  const defaultTheme = "dracula";
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      localStorage.getItem("theme") || defaultTheme
    );
  }, []);

  return (
    <Layout>
      <Head title={`Hussain Abbas | ${pageProps.title}`} />
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
