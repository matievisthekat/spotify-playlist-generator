import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { getAllPlaylistTracks, getPageOfPlaylistTracks, PlaylistTrack } from "../../../../../src/getPlaylistTracks";
import { getCreds, TokenCookies } from "../../../../../src/util";

export interface ApiMePlaylistTracksResponse {
  tracks: PlaylistTrack[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);
    const id = req.query.id as string;
    const limit = parseInt(req.query.limit as string);
    const offset = parseInt(req.query.offset as string);

    if (!accessToken || !refreshToken) {
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    getPageOfPlaylistTracks(updater, id, limit, offset)
      .then(async (page) => {
        const features = await updater.request<{ audio_features: Array<SpotifyApi.AudioFeaturesObject | null> }>({
          method: "GET",
          url: "https://api.spotify.com/v1/audio-features",
          params: { ids: page.items.map((item) => item.track.id).join(",") },
          authType: "bearer",
        });

        const tracks: PlaylistTrack[] = page.items.map((track) => {
          return {
            ...track,
            features: features.data.audio_features.find((f) => f?.id === track.track.id)
          }
        });

        res.status(200).json({ tracks });
        resolve(true);
      })
      .catch((err) => {
        res.status(500).json(err);
        reject();
      });
  });
}