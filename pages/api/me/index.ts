import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { getCreds, TokenCookies } from "../../../src/util";

export interface ApiMeResponse {
  me: SpotifyApi.CurrentUsersProfileResponse;
  playlists: SpotifyApi.PlaylistObjectSimplified[];
  clientId: string;
  clientSecret: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, clientSecret } = getCreds();
  const accessToken = TokenCookies.accessToken(req, res);
  const refreshToken = TokenCookies.refreshToken(req, res);

  if (!accessToken || !refreshToken) return { redirect: { destination: "/login" } };

  const updater = new Updater({ clientId, clientSecret });
  updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

  updater
    .request<SpotifyApi.CurrentUsersProfileResponse>({
      url: "https://api.spotify.com/v1/me",
      authType: "bearer"
    })
    .then((meRes) => {
      if (meRes.status !== 200) return res.status(500).json(meRes);

      updater
        .request<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
          url: "https://api.spotify.com/v1/me/playlists",
          authType: "bearer",
        })
        .then((plRes) => {
          if (plRes.status !== 200) return res.status(500).json(meRes);

          return res.status(200).json({
            me: meRes.data,
            playlists: plRes.data.items,
            clientId,
            clientSecret
          });
        })
        .catch((err) => res.status(500).json(err));
    })
    .catch((err) => res.status(500).json(err));

}