import { NextApiResponse, NextApiRequest } from "next";
import { getCreds, TokenCookies } from "../../../src/util";
import Updater from "spotify-oauth-refresher";
import { PlaylistTrack } from "../../../src/getPlaylistTracks";

export interface ApiSearchResponse {
  tracks: (SpotifyApi.TrackObjectFull & { audio_features: SpotifyApi.AudioFeaturesObject })[];
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
      .request<SpotifyApi.TrackSearchResponse>({
        url: "https://api.spotify.com/v1/search",
        params: {
          type: "track",
          q: req.query.query,
          offset: req.query.offset,
        },
        authType: "bearer",
      })
      .then(async (searchRes) => {
        if (searchRes.status !== 200) return res.status(500).json(searchRes.data);

        const features = await updater.request<{ audio_features: Array<SpotifyApi.AudioFeaturesObject | null> }>({
          method: "GET",
          url: "https://api.spotify.com/v1/audio-features",
          params: { ids: searchRes.data.tracks.items.map((item) => item.id).join(",") },
          authType: "bearer",
        });

        const tracks = searchRes.data.tracks.items.map((t, i) => {
          return {
            ...t,
            audio_features: features.data.audio_features[i]
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
