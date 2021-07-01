import { useRouter } from "next/router";
import { useEffect } from "react";
import qs from "querystring";
import axios from "axios";
import { getCreds } from "../src/util";
import Updater from "spotify-oauth-refresher";

interface Props {
  secret: string;
  id: string;
  uri: string;
}

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Callback({ uri, id, secret }: Props) {
  const router = useRouter();
  const updater = new Updater({ clientId: id, clientSecret: secret });

  useEffect(() => {
    const { code } = qs.parse(window.location.href.split("?")[1]);
    if (code) {
      axios
        .post(
          "https://accounts.spotify.com/api/token",
          qs.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: uri,
          }),
          {
            headers: {
              Authorization: `Basic ${updater.base64Creds}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then(async ({ data }) => {
          const { access_token, refresh_token } = data;
          updater.setAccessToken(access_token).setRefreshToken(refresh_token);
          router.push("/me");
        })
        .catch((err) => {
          console.error(err.response);
          router.push("/");
        });
    } else {
      router.push("/");
    }
  }, []);

  return (
    <div className="container">
      <main>
        <h1>Redirecting...</h1>
      </main>
    </div>
  );
}