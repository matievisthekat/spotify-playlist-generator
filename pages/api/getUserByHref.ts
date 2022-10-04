import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { getCreds, TokenCookies } from "../../src/util";

export type ApiGetUserByHref = SpotifyApi.UserObjectPublic;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<any>((resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);
    const href = req.query.href as string;

    if (!accessToken || !refreshToken) {
      res.json({ redirect: { destination: "/login" } });
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    updater.request<SpotifyApi.UserObjectPublic>({
      url: href,
      method: "GET",
      authType: "bearer"
    })
      .then(({ data }) => {
        res.status(200).json(data);
        resolve(data);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json(err);
        resolve(err);
      })
  });
}
