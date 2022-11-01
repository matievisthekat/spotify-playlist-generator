import type { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import Script from "next/script";
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
      
      <Script
        id="google-adsense"
        data-ad-client="ca-pub-4374857081025109"
        async={true}
        strategy="beforeInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374857081025109"
        onError={(e) => console.error('AdSense script failed to load: ', e)}
      ></Script>
      <Script
        id="google-tag-manager"
        strategy="beforeInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-7DMRTCSBEV"
      ></Script>
      <Script id="google-analytics" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7DMRTCSBEV');`}
      </Script>
      
      <NavPath />
      <Comp {...pageProps} />
    </>
  );
}
export default App;
