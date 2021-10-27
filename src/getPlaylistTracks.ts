import Updater from "spotify-oauth-refresher";

export const getPageOfPlaylistTracks = (updater: Updater, id: string, limit: number, offset: number) => {
  return new Promise<SpotifyApi.PlaylistTrackResponse | SpotifyApi.UsersSavedTracksResponse>((resolve, reject) => {
    if (id === "liked") {
      updater
        .request<SpotifyApi.UsersSavedTracksResponse>({
          url: "https://api.spotify.com/v1/me/tracks",
          params: { offset, limit: Math.min(limit, 50) }, // The Math.min() here makes sure the limit for liked songs does not excede 50
          authType: "bearer",
        })
        .then(({ data }) => resolve(data))
        .catch(reject);
    } else {
      updater
        .request<SpotifyApi.PlaylistTrackResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}/tracks`,
          params: { offset, limit },
          authType: "bearer",
        })
        .then(({ data }) => resolve(data))
        .catch(reject);
    }
  });
};

export const getAllPlaylistTracks = async (updater: Updater, id: string) => {
  let allOffset = 0;
  let continueAllLoop = true;

  const tracks = [];
  const limit = id === "liked" ? 50 : 100;

  do {
    const page = await getPageOfPlaylistTracks(updater, id, limit, allOffset);

    if (page.items.length > 0) {
      allOffset += limit;
      tracks.push(...page.items);
    } else continueAllLoop = false;
  } while (continueAllLoop);

  return tracks;
};
