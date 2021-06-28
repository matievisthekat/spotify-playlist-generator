import NavPath from "../src/components/NavPath";
import type { AppProps } from "next/app";
import "../styles/globals.sass";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavPath />
      <Component {...pageProps} />
    </>
  );
}
export default App;
