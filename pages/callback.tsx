import { useRouter } from "next/router";
import { useEffect } from "react";
import qs from "querystring";
import axios from "axios";
import { updater } from "../src/util";

interface Props {
  secret: string;
  id: string;
  uri: string;
}

export async function getStaticProps() {
  return {
    props: {
      secret: process.env.SECRET,
      id: process.env.ID,
      uri: process.env.REDIRECT_URI,
    },
  };
}

export default function Callback({ secret, id, uri }: Props) {
  const router = useRouter();

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
              Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
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
