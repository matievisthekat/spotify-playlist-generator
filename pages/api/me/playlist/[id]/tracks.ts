import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { getAllPlaylistTracks, PlaylistTrack } from "../../../../../src/getPlaylistTracks";
import { getCreds, TokenCookies } from "../../../../../src/util";

export interface ApiMePlaylistTracksResponse {
  tracks: PlaylistTrack[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { clientId, clientSecret } = getCreds();
  const accessToken = TokenCookies.accessToken(req, res);
  const refreshToken = TokenCookies.refreshToken(req, res);
  const id = req.query.id as string;

  if (!accessToken || !refreshToken) return { redirect: { destination: "/login" } };

  const updater = new Updater({ clientId, clientSecret });
  updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

  getAllPlaylistTracks(updater, id)
    .then((tracks) => res.status(200).json({ tracks }))
    .catch((err) => res.status(500).json(err));
}