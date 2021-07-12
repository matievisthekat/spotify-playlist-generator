import type { AppProps } from "next/app";
import NavPath from "../src/components/NavPath";
import Seo from "../src/components/Seo";
import "../styles/globals.sass";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Seo />
      <NavPath />
      <Component {...pageProps} />
    </>
  );
}
export default App;
