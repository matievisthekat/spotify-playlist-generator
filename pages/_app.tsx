import Head from "next/head";
import type { AppProps } from "next/app";
import "../styles/globals.sass";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
export default App;
