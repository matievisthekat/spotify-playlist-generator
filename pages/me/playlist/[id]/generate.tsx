import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Updater from "spotify-oauth-refresher";
import DoubleSliderInput from "../../../../src/components/DoubleSliderInput";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
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
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<PlaylistTrack[]>();
  const [filteredTracks, setFilteredTracks] = useState<PlaylistTrack[]>();
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
    setFilteredTracks(
      tracks?.filter(({ features }) => {
        return (
          features.danceability * 100 > danceability[0] &&
          features.danceability * 100 < danceability[1] &&
          features.acousticness * 100 > acousticness[0] &&
          features.acousticness * 100 < acousticness[1] &&
          features.energy * 100 > energy[0] &&
          features.energy * 100 < energy[1] &&
          features.instrumentalness * 100 > instrumentalness[0] &&
          features.instrumentalness * 100 < instrumentalness[1] &&
          features.liveness * 100 > liveness[0] &&
          features.liveness * 100 < liveness[1] &&
          features.speechiness * 100 > speechiness[0] &&
          features.speechiness * 100 < speechiness[1] &&
          features.valence * 100 > valence[0] &&
          features.valence * 100 < valence[1] &&
          features.tempo > tempo[0] &&
          features.tempo < tempo[1]
        );
      })
    );
  }, [tracks, danceability, acousticness, energy, instrumentalness, liveness, speechiness, valence, tempo]);

  useEffect(() => {
    setLoading(true);
    getAllPlaylistTracks(updater, id as string).then((plTracks) => setTracks(plTracks));
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
        .catch((err) => setError(err?.message))
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
        .catch((err) => setError(err?.message))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="container">
      <div className={styles.info}>
        {pl && (
          <span className={styles.image}>
            <img src={pl.image} width={100} height={100} alt="Playlist cover image" />
          </span>
        )}
        <h2>{loading ? `Fetching playlist ${id}...` : pl?.name}</h2>
        {pl && (
          <>
            <br />
            <small className={styles.credits}>
              by{" "}
              <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.display_name || pl.owner.id}</ExternalLink>
            </small>
            <br />
            <span>{pl.total} tracks</span>
          </>
        )}
      </div>
      {error && <span className="error">{error}</span>}
      <div className={styles.filters}>
        <div>
          <div className={styles.heading}>
            <h5 title="Danceability">Danceability</h5>
          </div>
          <div>
            <DoubleSliderInput value={danceability} onChange={setDanceability} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Acousticness">Acousticness</h5>
          </div>
          <div>
            <DoubleSliderInput value={acousticness} onChange={setAcousticness} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Energy">Energy</h5>
          </div>
          <div>
            <DoubleSliderInput value={energy} onChange={setEnergy} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Instrumentalness">Instrumentalness</h5>
          </div>
          <div>
            <DoubleSliderInput value={instrumentalness} onChange={setInstrumentalness} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Liveness">Liveness</h5>
          </div>
          <div>
            <DoubleSliderInput value={liveness} onChange={setLiveness} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Speechiness">Speechiness</h5>
          </div>
          <div>
            <DoubleSliderInput value={speechiness} onChange={setSpeechiness} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Valence">Valence</h5>
          </div>
          <div>
            <DoubleSliderInput value={valence} onChange={setValence} min={0} max={100} />
          </div>
        </div>

        <div>
          <div className={styles.heading}>
            <h5 title="Tempo">Tempo</h5>
          </div>
          <div>
            <DoubleSliderInput value={tempo} onChange={setTempo} min={0} max={300} />
          </div>
        </div>
      </div>
      <div className={styles.results}>
        {filteredTracks ? (
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
        ) : (
          <span className="error">No tracks found. Maybe try some different filters?</span>
        )}
      </div>
    </div>
  );
}
