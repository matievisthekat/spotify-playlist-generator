import Updater from "spotify-oauth-refresher";

export interface PlaylistTrack extends SpotifyApi.PlaylistTrackObject {
  features?: SpotifyApi.AudioFeaturesObject;
}

export const getPageOfPlaylistTracks = (updater: Updater, id: string, limit: number, offset: number) => {
  return new Promise<SpotifyApi.PlaylistTrackResponse>((resolve, reject) => {
    if (id === "liked") {
      updater
        .request<SpotifyApi.PlaylistTrackResponse>({
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

  const tracks: PlaylistTrack[] = [];
  const limit = id === "liked" ? 50 : 100;

  do {
    const page = await getPageOfPlaylistTracks(updater, id, limit, allOffset);
    const features = await updater.request<{ audio_features: Array<SpotifyApi.AudioFeaturesObject | null> }>({
      method: "GET",
      url: "https://api.spotify.com/v1/audio-features",
      params: { ids: page.items.map((item) => item.track.id).join(",") },
      authType: "bearer",
    });

    if (page.items.length > 0) {
      allOffset += limit;
      page.items.forEach((item, i) => {
        tracks.push({
          ...item,
          features: features.data.audio_features.find((f) => f?.id === item.track.id) ?? undefined,
        });
      });
    } else continueAllLoop = false;
  } while (continueAllLoop);

  return tracks;
};
