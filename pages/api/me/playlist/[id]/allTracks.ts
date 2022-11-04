import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { getAllPlaylistTracks, PlaylistTrack } from "../../../../../src/getPlaylistTracks";
import { getCreds, TokenCookies } from "../../../../../src/util";

export const config = {
  api: {
    responseLimit: false,
  },
}

export interface ApiMePlaylistAllTracksResponse {
  tracks: PlaylistTrack[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);
    const id = req.query.id as string;

    if (!accessToken || !refreshToken) {
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    getAllPlaylistTracks(updater, id)
      .then(async (tracks) => {
        res.status(200).json({ tracks });
        resolve(true);
      })
      .catch((err) => {
        res.status(500).json(err);
        reject();
      });
  });
}
