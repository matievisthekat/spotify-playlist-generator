import { NextApiResponse, NextApiRequest } from "next";
import Updater from "spotify-oauth-refresher";
import { CredProps, getCreds, TokenCookies } from "../../../../../src/util";

export interface ApiMePlaylistIdResponse extends CredProps {
  playlist: SpotifyApi.SinglePlaylistResponse;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<any>((resolve, reject) => {
    const { clientId, clientSecret } = getCreds();
    const accessToken = TokenCookies.accessToken(req, res);
    const refreshToken = TokenCookies.refreshToken(req, res);
    const id = req.query.id as string;
    const isLikedSongs = id ==="liked";

    if (!accessToken || !refreshToken) {
      res.json({ redirect: { destination: "/login" } });
      resolve({ redirect: { destination: "/login" } });
      return;
    }

    const updater = new Updater({ clientId, clientSecret });
    updater.setAccessToken(accessToken).setRefreshToken(refreshToken);

    if (isLikedSongs) {
      updater
        .request<SpotifyApi.UsersSavedTracksResponse>({
          url: `https://api.spotify.com/v1/me/tracks`,
          authType: "bearer",
        })
        .then((likedRes) => {
          if (likedRes.status !== 200) {
            res.status(likedRes.status).json(likedRes.data);
            return;
          }

          const playlist = {
            name: "Liked Songs",
            followers: {
              href: null,
              total: 0,
            },
            tracks: {
              href: "",
              total: likedRes.data.total,
              limit: 50,
              next: null,
              previous: null,
              items: [],
              offset: 0,
            },
            collaborative: false,
            description: "",
            id: "liked",
            images: [
              {
                url: "/liked.png",
              },
            ],
            owner: {
              uri: "https://open.spotify.com",
              id: "",
              display_name: "you",
              external_urls: {
                spotify: "https://open.spotify.com",
              },
              href: "",
              type: "user",
            },
            public: false,
            snapshot_id: "",
            type: "playlist",
            href: "",
            external_urls: {
              spotify: "https://open.spotify.com/collection/tracks",
            },
            uri: "",
          };

          res.status(200).json({ playlist, ...getCreds() });
          resolve(true);
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    } else {
      updater
        .request<SpotifyApi.SinglePlaylistResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}`,
          authType: "bearer",
        })
        .then((plRes) => {
          if (plRes.status !== 200) {
            res.status(plRes.status).json(plRes.data);
            return;
          }

          res.status(200).json({ playlist: plRes.data, ...getCreds() });
          resolve(true);
        })
        .catch((err) => {
          res.status(500).json(err);
        });
    }
  });
}