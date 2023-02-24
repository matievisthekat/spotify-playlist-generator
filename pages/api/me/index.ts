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
  return new Promise<any>((resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);

    if (!accessToken || !refreshToken) {
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    updater
      .request<SpotifyApi.CurrentUsersProfileResponse>({
        url: "https://api.spotify.com/v1/me",
        authType: "bearer"
      })
      .then(async (meRes) => {
        if (meRes.status !== 200) {
          res.status(500).json(meRes);
          reject();
          return;
        }

        let done = false;
        let offset = 0;
        const playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
        while (!done) {
          const plRes = await updater.request<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>({
            url: "https://api.spotify.com/v1/me/playlists",
            params: {
              limit: 50,
              offset,
            },
            authType: "bearer",
          }).catch((err) => {
            res.status(500).json(err);
            reject();
          });

          if (!plRes || plRes.data.items.length < 1) {
            done = true;
          } else if (plRes.status !== 200) {
            res.status(500).json(meRes);
            reject();
            done = true;
            return;
          } else {
            playlists.push(...plRes.data.items);
            offset += 50;
          }
        }

        
        res.status(200).json({
          me: meRes.data,
          playlists,
          clientId,
          clientSecret
        });
        resolve(true);
      })
      .catch((err) => {
        res.status(500).json(err);
        reject();
      });
  });
}