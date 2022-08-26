import { NextApiResponse, NextApiRequest } from "next";
import { getCreds, TokenCookies } from "../../../src/util";
import Updater from "spotify-oauth-refresher";

export interface ApiSearchResponse {
  tracks: SpotifyApi.TrackObjectFull[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, clientSecret } = getCreds();
  const accessToken = TokenCookies.accessToken(req, res);
  const refreshToken = TokenCookies.refreshToken(req, res);

  if (!accessToken || !refreshToken) return { redirect: { destination: "/login" } };

  const updater = new Updater({ clientId, clientSecret });
  updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

  updater
    .request<SpotifyApi.TrackSearchResponse>({
      url: "https://api.spotify.com/v1/search",
      params: {
        type: "track",
        q: req.query.query,
        offset: req.query.offset,
      },
      authType: "bearer",
    })
    .then((searchRes) => {
      if (searchRes.status !== 200) return res.status(500).json(searchRes.data);

      res.status(200).json({
        tracks: searchRes.data.tracks.items
      });
    })
    .catch((err) => res.status(500).json(err))
}
