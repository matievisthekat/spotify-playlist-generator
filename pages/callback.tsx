import { useRouter } from "next/router";
import { useEffect } from "react";
import qs from "querystring";
import axios from "axios";
import { CredProps, getCreds } from "../src/util";
import Updater from "spotify-oauth-refresher";
import { ServerResponse, IncomingMessage } from "http";

interface Props extends CredProps {
  access_token: string;
  refresh_token: string;
}

export async function getServerSideProps({ resolvedUrl }: { resolvedUrl: string }) {
  const creds = getCreds();
  const base64 = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64url");
  const { code } = qs.parse(resolvedUrl.split("?").pop() || "");

  if (!code) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  }

  const params = qs.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: creds.uri,
  });

  const response = await axios.post("https://accounts.spotify.com/api/token", params, {
    headers: {
      Authorization: `Basic ${base64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch((err) => console.error(err));

  if (!response) {
    return {
      redirect: {
        destination: "/",
        permanent: true,
      },
    };
  } else {
    const { access_token, refresh_token } = response.data;
    return { props: { access_token, refresh_token, clientId: creds.clientId, clientSecret: creds.clientSecret } };
  }
}

export default function Callback({ clientId, clientSecret, access_token, refresh_token }: Props) {
  const router = useRouter();
  const updater = new Updater({ clientId, clientSecret });

  useEffect(() => {
    if (access_token) {
      updater.setAccessToken(access_token).setRefreshToken(refresh_token);
      router.push("/me");
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
