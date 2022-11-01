import type { AppProps } from "next/app";
import Router from "next/router";
import progress from "nprogress";
import NavPath from "../src/components/NavPath";
import Seo from "../src/components/Seo";
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
      <Seo />
      
      <script id="google-ad-sense" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374857081025109" crossOrigin="anonymous"></script>
      <script id="google-tag-manager" async src="https://www.googletagmanager.com/gtag/js?id=G-7DMRTCSBEV"></script>
      <script id="google-analytics" async>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-7DMRTCSBEV');
        `}
      </script>
      
      <NavPath />
      <Comp {...pageProps} />
    </>
  );
}
export default App;
