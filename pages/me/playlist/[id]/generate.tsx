import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Updater from "spotify-oauth-refresher";
import DoubleSliderInput from "../../../../src/components/DoubleSliderInput";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
import SkeletonTrack from "../../../../src/components/SkeletonTrack";
import { createPlaylist } from "../../../../src/createPlaylist";
import { getAllPlaylistTracks, PlaylistTrack } from "../../../../src/getPlaylistTracks";
import { getCreds, CredProps } from "../../../../src/util";
import styles from "../../../../styles/pages/Generate.module.sass";

interface Playlist {
  name: string;
  desc: string | null;
  url: string;
  image: string;
  total: number;
  owner: SpotifyApi.UserObjectPublic;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Generate(props: CredProps) {
  const [pl, setPl] = useState<Playlist>();
  const [newPlName, setNewPlName] = useState("");
  const [creating, setCreating] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [tracks, setTracks] = useState<PlaylistTrack[]>();
  const [filteredTracks, setFilteredTracks] = useState<PlaylistTrack[]>();
  const [shownTracks, setShownTracks] = useState<PlaylistTrack[]>([]);
  const [danceability, setDanceability] = useState([0, 100]);
  const [acousticness, setAcousticness] = useState([0, 100]);
  const [energy, setEnergy] = useState([0, 100]);
  const [instrumentalness, setInstrumentalness] = useState([0, 100]);
  const [liveness, setLiveness] = useState([0, 100]);
  const [speechiness, setSpeechiness] = useState([0, 100]);
  const [valence, setValence] = useState([0, 100]);
  const [tempo, setTempo] = useState([0, 300]);
  const [modal, setModal] = useState(-1);
  const [error, setError] = useState<string>();
  const updater = new Updater(props);
  const router = useRouter();
  const { id } = router.query;
  const liked = id === "liked";

  useEffect(() => {
    if (filteredTracks) setShownTracks(filteredTracks.slice(0, 49));
  }, [tracks, filteredTracks]);

  useEffect(() => {
    setFilteredTracks(
      tracks?.filter(({ features }) => {
        return (
          (features?.danceability ?? 0) * 100 > danceability[0] &&
          (features?.danceability ?? 0) < danceability[1] &&
          (features?.acousticness ?? 0) * 100 > acousticness[0] &&
          (features?.acousticness ?? 0) * 100 < acousticness[1] &&
          (features?.energy ?? 0) * 100 > energy[0] &&
          (features?.energy ?? 0) * 100 < energy[1] &&
          (features?.instrumentalness ?? 0) * 100 > instrumentalness[0] &&
          (features?.instrumentalness ?? 0) * 100 < instrumentalness[1] &&
          (features?.liveness ?? 0) * 100 > liveness[0] &&
          (features?.liveness ?? 0) * 100 < liveness[1] &&
          (features?.speechiness ?? 0) * 100 > speechiness[0] &&
          (features?.speechiness ?? 0) * 100 < speechiness[1] &&
          (features?.valence ?? 0) * 100 > valence[0] &&
          (features?.valence ?? 0) * 100 < valence[1] &&
          (features?.tempo ?? 0) > tempo[0] &&
          (features?.tempo ?? 0) < tempo[1]
        );
      })
    );
  }, [tracks, danceability, acousticness, energy, instrumentalness, liveness, speechiness, valence, tempo]);

  useEffect(() => {
    setLoading(true);

    setLoadingTracks(true);
    getAllPlaylistTracks(updater, id as string)
      .then((plTracks) => setTracks(plTracks))
      .finally(() => setLoadingTracks(false));

    if (liked) {
      updater
        .request<SpotifyApi.UsersSavedTracksResponse>({
          url: "https://api.spotify.com/v1/me/tracks",
          authType: "bearer",
        })
        .then(({ data }) =>
          setPl({
            name: "Liked Songs",
            desc: "Songs you have liked",
            url: "https://open.spotify.com/collection/tracks",
            image: "/liked.png",
            owner: {
              id: "you",
              href: "https://open.spotify.com",
              type: "user",
              uri: "spotify:user:me",
              external_urls: { spotify: "https://open.spotify.com" },
            },
            total: data.total,
          })
        )
        .catch((err) => {
          console.error(err);
          setError(err?.message);
        })
        .finally(() => setLoading(false));
    } else {
      updater
        .request<SpotifyApi.SinglePlaylistResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}`,
          authType: "bearer",
        })
        .then(({ data }) =>
          setPl({
            name: data.name,
            desc: data.description,
            url: data.external_urls.spotify,
            image: data.images[0].url,
            owner: data.owner,
            total: data.tracks.total,
          })
        )
        .catch((err) => {
          console.error(err);
          setError(err?.message);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  if (creating)
    return (
      <div className={styles.creatingOverlay} style={{ textAlign: "center", marginTop: "10px" }}>
        <h1>{creatingProgress}%</h1>
        {error && <h2 className="error">{error}</h2>}
      </div>
    );

  return (
    <div className="container">
      <div className={styles.info}>
        {pl && (
          <span className={styles.image}>
            <img src={pl.image} width={100} height={100} alt="Playlist cover image" />
          </span>
        )}
        <h2 style={{ display: "block" }}>{loading ? `Fetching playlist ${id}...` : pl?.name}</h2>
        {pl && (
          <div className={styles.credits}>
            by <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.display_name || pl.owner.id}</ExternalLink>
          </div>
        )}
      </div>
      <form
        className={styles.newPlInfo}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newPlName) return setError("No playlist name provided");
          if (!filteredTracks)
            return setError("You can't create a playlist with no tracks! Maybe try some different filters");

          setCreating(true);
          setError(undefined);

          const { data } = await updater.request<SpotifyApi.UserObjectPublic>({
            method: "GET",
            url: "https://api.spotify.com/v1/me",
            authType: "bearer",
          });

          await createPlaylist(
            newPlName,
            data.id,
            {
              tracks: filteredTracks,
              pub: true,
              onDone: (pl) => router.push(`/me/playlist/${pl.id}`),
              onProgress: setCreatingProgress,
            },
            updater
          ).catch((e) => {
            console.log(e);
            setError(e.message || e.toString());
          });
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Playlist name"
            value={newPlName}
            onChange={(e) => setNewPlName(e.target.value)}
            autoFocus
          />
          <button type="submit">Create</button>
        </div>
        <div style={{ fontStyle: "italic" }}>
          Filter the tracks below, then click &quot;Create&quot; to create a new playlist with the filtered tracks!
        </div>
      </form>
      {error && <span className="error">{error}</span>}
      <div className={styles.filters}>
        <div className={styles.col}>
          <h5>Danceability</h5>
          <DoubleSliderInput onChangeCommitted={setDanceability} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Acousticness</h5>
          <DoubleSliderInput onChangeCommitted={setAcousticness} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Energy</h5>
          <DoubleSliderInput onChangeCommitted={setEnergy} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Instrumentalness</h5>
          <DoubleSliderInput onChangeCommitted={setInstrumentalness} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Liveness</h5>
          <DoubleSliderInput onChangeCommitted={setLiveness} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Speechiness</h5>
          <DoubleSliderInput onChangeCommitted={setSpeechiness} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Valence</h5>
          <DoubleSliderInput onChangeCommitted={setValence} min={0} max={100} />
        </div>

        <div className={styles.col}>
          <h5>Tempo</h5>
          <DoubleSliderInput onChangeCommitted={setTempo} min={0} max={300} />
        </div>
      </div>
      <div className={styles.results}>
        {filteredTracks ? (
          filteredTracks.length > 50 ? (
            <InfiniteScroll
              pageStart={0}
              hasMore={shownTracks?.length < filteredTracks.length}
              loadMore={(page) => {
                if (page > 1) {
                  setShownTracks([
                    ...shownTracks,
                    ...filteredTracks.slice(shownTracks.length - 1, shownTracks.length + 49),
                  ]);
                }
              }}
            >
              {shownTracks.map((t, i) => (
                <Result
                  track={t.track}
                  features={t.features}
                  added_at={t.added_at}
                  added_by={t.added_by}
                  is_local={t.is_local}
                  showModal={i === modal}
                  setShowModal={(show) => setModal(show ? i : -1)}
                  updater={updater}
                  key={i}
                />
              ))}
            </InfiniteScroll>
          ) : (
            filteredTracks.map((t, i) => (
              <Result
                track={t.track}
                features={t.features}
                added_at={t.added_at}
                added_by={t.added_by}
                is_local={t.is_local}
                showModal={i === modal}
                setShowModal={(show) => setModal(show ? i : -1)}
                updater={updater}
                key={i}
              />
            ))
          )
        ) : loadingTracks ? (
          new Array(10).fill(null).map((_, i) => <SkeletonTrack key={i} />)
        ) : (
          <span className="error">No tracks found</span>
        )}
      </div>
    </div>
  );
}
