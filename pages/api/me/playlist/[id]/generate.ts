import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { PlaylistTrack } from "../../../../../src/getPlaylistTracks";
import { getCreds, TokenCookies } from "../../../../../src/util";

export type ApiMePlaylistIdGenerateResponse = SpotifyApi.CreatePlaylistResponse;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<any>(async (resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);

    if (!accessToken || !refreshToken) {
      res.json({ redirect: { destination: "/login" } });
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    const body: { name: string, tracks: PlaylistTrack[] } = req.body;

    if (!body.tracks) {
      res.status(400).json({ error: "Missing 'tracks' body field" });
      resolve(false);
      return;
    }

    if (!body.name) {
      res.status(400).json({ error: "Missing 'name' body field" });
      resolve(false);
      return;
    }

    const { data: me } = await updater.request<SpotifyApi.UserObjectPublic>({
      method: "GET",
      url: "https://api.spotify.com/v1/me",
      authType: "bearer",
    });

    updater
      .request<SpotifyApi.CreatePlaylistResponse>({
        method: "POST",
        url: `https://api.spotify.com/v1/users/${me.id}/playlists`,
        data: JSON.stringify({
          name: body.name,
          public: true,
          collaborative: false,
          description: "",
        }),
        authType: "bearer",
      })
      .then(({ data }) => {
        const totalChunks = Math.ceil(body.tracks.length / 100);
        let currentChunk = 0;

        const interval: NodeJS.Timer = setInterval(() => {
          if (currentChunk >= totalChunks) {
            clearInterval(interval);
            res.status(201).json(data);
            resolve(data);
            return;
          }

          const chunk = body.tracks.slice(currentChunk * 100, (currentChunk + 1) * 100);
          updater
            .request<SpotifyApi.AddTracksToPlaylistResponse>({
              method: "POST",
              url: `https://api.spotify.com/v1/playlists/${data.id}/tracks`,
              data: JSON.stringify({ uris: chunk.map((t) => t.track.uri) }),
              authType: "bearer",
            })
            .catch((err) => console.error(err));

          currentChunk++;
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        resolve(err);
        res.status(500).json(err);
      });
  });
}