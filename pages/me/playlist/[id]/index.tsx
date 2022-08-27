import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import InfiniteScroll from "react-infinite-scroller";
import axios from "axios";
import qs from "querystring";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
import GenerateButton from "../../../../src/components/GenerateButton";
import SkeletonTrack from "../../../../src/components/SkeletonTrack";
import FeatureDisplay from "../../../../src/components/FeatureDisplay";
import { escapeHex, Sort, sortTracks, SortOrder } from "../../../../src/util";
import { PlaylistTrack } from "../../../../src/getPlaylistTracks";
import { ApiMePlaylistIdResponse } from "../../../api/me/playlist/[id]";
import styles from "../../../../styles/pages/Playlist.module.sass";
import { ApiMePlaylistTracksResponse } from "../../../api/me/playlist/[id]/tracks";

export default function Playlist() {
  const [updater, setUpdater] = useState<Updater>();
  const [playlist, setPlaylist] = useState<SpotifyApi.PlaylistObjectFull>();
  const [tracks, _setTracks] = useState<PlaylistTrack[]>([]);
  const [shownTracks, _setShownTracks] = useState<PlaylistTrack[]>([]);
  const [modal, setModal] = useState(-1);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [sort, setSort] = useState<Sort>("default");
  const [error, setError] = useState("");
  const router = useRouter();
  const id = router.query.id;
  const liked = id === "liked";

  const setShownTracks = (tracks: PlaylistTrack[]) => _setShownTracks(sortTracks(sortOrder, sort, tracks));
  const setTracks = (tracks: PlaylistTrack[]) => _setTracks(sortTracks(sortOrder, sort, tracks));

  useEffect(() => {
    if (id !== undefined) {
      axios.get<ApiMePlaylistIdResponse>(`/api/me/playlist/${id}`)
        .then((res) => {
          setPlaylist(res.data.playlist);
          setUpdater(new Updater({ clientId: res.data.clientId, clientSecret: res.data.clientSecret }));

          axios.get<ApiMePlaylistTracksResponse>(`/api/me/playlist/${id}/tracks`)
            .then((res) => {
              setTracks(res.data.tracks);
            })
            .catch((err) => setError(err.toString()));
        })
        .catch((err) => setError(err.toString()));
    }
  }, [id]);

  useEffect(() => {
    if (tracks.length === playlist?.tracks.total) {
      setTracks(tracks);
      setShownTracks(tracks.slice(0, 50));
    }
  }, [sort, sortOrder]);

  return (
    <div className="container">
      {playlist && (
        <span className={styles.cover}>
          <img src={playlist.images[0].url} width={200} height={200} alt="Playlist cover image" />
        </span>
      )}
      <h2>
        {liked ? "Liked Songs" : playlist ? playlist.name : `Unknown`}
        <GenerateButton href={`/me/playlist/${id}/generate`} />
      </h2>
      {playlist && (
        <span className={styles.credits}>
          Created by <ExternalLink href={playlist.owner.external_urls.spotify}>{playlist.owner.display_name}</ExternalLink>
        </span>
      )}
      {playlist && playlist.description && <span>{escapeHex(playlist.description)}</span>}
      <span>
        <select onChange={(e) => setSort(e.target.value as Sort)} value={sort}>
          <option value="default">Default</option>
          <option value="name">Name</option>
          <option value="album">Album</option>
          <option value="artist">Artist</option>
          <option value="added-at">Added at</option>
          <option value="duration">Duration</option>
        </select>
      </span>
      <span>
        <select onChange={(e) => setSortOrder(e.target.value as SortOrder)} value={sortOrder}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </span>
      {error && <span className="error">{error}</span>}
      <main>
        <div className={styles.average}>
          {tracks.length === playlist?.tracks.total ? (
            <>
              <FeatureDisplay
                displayLike="number"
                title="Avg. Danceability"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.danceability ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average danceability"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Acouticness"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.acousticness ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average acousticness"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Energy"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.energy ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average energy"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Instrumentalness"
                value={
                  (tracks.reduce((prev, curr) => (prev += curr.features?.instrumentalness ?? 0), 0) / tracks.length) * 100
                }
                infoText="This playlist's average instrumentalness"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Liveness"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.liveness ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average liveness"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Speechiness"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.speechiness ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average speechiness"
              />
              <FeatureDisplay
                displayLike="number"
                title="Avg. Positivity"
                value={(tracks.reduce((prev, curr) => (prev += curr.features?.valence ?? 0), 0) / tracks.length) * 100}
                infoText="This playlist's average positivity"
              />
              <FeatureDisplay
                displayLike="text"
                title="Avg. Tempo"
                text={(tracks.reduce((prev, curr) => (prev += curr.features?.tempo ?? 0), 0) / tracks.length).toFixed(2)}
                infoText="This playlist's average tempo"
              />
            </>
          ) : (
            <></>
          )}
        </div>
        <div className={styles.tracks}>
          {tracks.length === playlist?.tracks.total ? (
            /*
            You may be wondering why im still scroll-loading the tracks when i spent
            a lot of time making it possible to get all the tracks at once. Well
            rendering 800+ tracks literally crashes the browser. So having all the tracks
            in memory makes sorting possible while still being usable.

            thank you for coming to my ted talk
            */
            <InfiniteScroll
              pageStart={0}
              hasMore={shownTracks.length < tracks.length}
              loadMore={(page) => {
                if (page > 1) {
                  setShownTracks([...shownTracks, ...tracks.slice(shownTracks.length - 1, shownTracks.length + 49)]);
                }
              }}
            >
              {updater && shownTracks.map((t, i) => (
                <Result
                  {...t}
                  setShowModal={(v: boolean) => setModal(v ? i : -1)}
                  showModal={modal === i}
                  updater={updater}
                  key={i}
                  compact
                />
              ))}
            </InfiniteScroll>
          ) : (
            new Array(10).fill(null).map((_, i) => <SkeletonTrack key={i} />)
          )}
        </div>
      </main>
    </div>
  );
}
