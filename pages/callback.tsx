import qs from "querystring";
import axios from "axios";
import { setCookie } from "cookies-next";
import { getCreds, TokenCookies } from "../src/util";
import { ServerResponse, IncomingMessage } from "http";
import Link from "next/link";

export async function getServerSideProps({ req, res, resolvedUrl }: { req: IncomingMessage, res: ServerResponse, resolvedUrl: string }) {
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
    TokenCookies.setAccessToken(access_token, req, res).setRefreshToken(refresh_token, req, res);
  }
}

export default function Callback() {
  return (
    <div className="container">
      <main>
        <h1>Click <Link href={"/me"}>here</Link> to continue...</h1>
      </main>
    </div>
  );
}
