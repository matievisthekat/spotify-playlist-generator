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
      <NavPath />
      <Comp {...pageProps} />
    </>
  );
}
export default App;
