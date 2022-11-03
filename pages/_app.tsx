import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import Script from "next/script";
import progress from "nprogress";
import NavPath from "../src/components/NavPath";
import "../styles/globals.sass";

progress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

Router.events.on("routeChangeStart", () => progress.start());
Router.events.on("routeChangeComplete", () => progress.done());
Router.events.on("routeChangeError", () => progress.done());

function App({ Component, pageProps }: AppProps) {


  // TODO: clear this bug up
  const Comp = Component as any;
  return (
    <>
      <Head>
        <title>Spotify Playlist Generator</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Generate playlists based on song features (danceability, energy, positivity, etc...)"
        />
      </Head>
      <NavPath />
      <Comp {...pageProps} />
    </>
  );
}
export default App;
