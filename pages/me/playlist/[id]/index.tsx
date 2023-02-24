import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import InfiniteScroll from "react-infinite-scroller";
import { ScaleLoader } from "react-spinners";
import axios from "axios";
import he from "he";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
import GenerateButton from "../../../../src/components/GenerateButton";
import SkeletonTrack from "../../../../src/components/SkeletonTrack";
import FeatureDisplay from "../../../../src/components/FeatureDisplay";
import { escapeHex, Sort, sortTracks } from "../../../../src/util";
import { PlaylistTrack } from "../../../../src/getPlaylistTracks";
import { ApiMePlaylistIdResponse } from "../../../api/me/playlist/[id]";
import { ApiMePlaylistTracksResponse } from "../../../api/me/playlist/[id]/tracks";
import styles from "../../../../styles/pages/Playlist.module.sass";
import DefaultAd from "../../../../src/components/DefaultAd";

export default function Playlist() {
  const [updater, setUpdater] = useState<Updater>();
  const [playlist, setPlaylist] = useState<SpotifyApi.PlaylistObjectFull>();
  const [tracks, _setTracks] = useState<PlaylistTrack[]>([]);
  const [modal, setModal] = useState(-1);
  const [sort, setSort] = useState<Sort>("default");
  const [error, setError] = useState("");
  const router = useRouter();
  const id = router.query.id;
  const liked = id === "liked";

  const setTracks = (tracks: PlaylistTrack[]) => _setTracks(sortTracks("asc", sort, tracks));

  const getPage = (pageNum: number) => {
    return new Promise<PlaylistTrack[]>((resolve, reject) => {
      if (id === undefined) reject();
      axios.get<ApiMePlaylistTracksResponse>(`/api/me/playlist/${id}/tracks?limit=50&offset=${pageNum * 50}`)
        .then((res) => {
          resolve(res.data.tracks);
        })
        .catch(reject);
    })
  }

  const loadMore = (page: number) => {
    getPage(page).then((newTracks) => {
      setTracks([...tracks, ...newTracks]);
    })
  }

  useEffect(() => {
    if (id !== undefined) {
      axios.get<ApiMePlaylistIdResponse>(`/api/me/playlist/${id}`)
        .then((res) => {
          setPlaylist(res.data.playlist);
          setUpdater(new Updater({ clientId: res.data.clientId, clientSecret: res.data.clientSecret }));

          getPage(0).then(async (pageOneTracks) => {
            setTracks(pageOneTracks);
          });
        })
        .catch((err) => setError(err.toString()));
    }
  }, [id]);

  return (
    <div className="container">
      {playlist && (
        <span className={styles.cover}>
          <img src={playlist.images[0]?.url} width={200} height={200} alt="Playlist cover image" />
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
      {playlist && playlist.description && <span>{escapeHex(he.decode(playlist.description))}</span>}
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
        {/* <select onChange={(e) => setSortOrder(e.target.value as SortOrder)} value={sortOrder}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select> */}
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
          {tracks.length > 0 ? (
            <InfiniteScroll
              initialLoad={false}
              loader={
                <div style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <ScaleLoader color="#1DB954" />
                </div>
              }
              pageStart={1}
              hasMore={tracks.length < (playlist?.tracks.total ?? 0)}
              loadMore={loadMore}
            >
              {updater ? tracks.map((t, i) => (
                <>
                  {i % 10 == 0 && <DefaultAd key={i} />}
                  <Result
                    {...t}
                    setShowModal={(v: boolean) => setModal(v ? i : -1)}
                    showModal={modal === i}
                    updater={updater}
                    key={t.track.id}
                    compact
                  />
                </>
              )) : <></>}
            </InfiniteScroll>
          ) : (
            new Array(10).fill(null).map((_, i) => <SkeletonTrack key={i} />)
          )}
        </div>
      </main>
    </div>
  );
}
