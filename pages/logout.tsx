import { useEffect } from "react";
import Updater from "spotify-oauth-refresher";
import { CredProps, getCreds } from "../src/util";

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Login({ clientId, clientSecret }: CredProps) {
  useEffect(() => {
    const updater = new Updater({ clientId, clientSecret });
    updater.removeAccessToken().removeRefreshToken();
    window.location.href = "/";
  }, []);

  return (
    <div className="container">
      <main>
        <h1>Redirecting...</h1>
      </main>
    </div>
  );
}
