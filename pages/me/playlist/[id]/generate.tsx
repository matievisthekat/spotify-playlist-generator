import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Updater from "spotify-oauth-refresher";
import DoubleSliderInput from "../../../../src/components/DoubleSliderInput";
import ExternalLink from "../../../../src/components/ExternalLink";
import { PlaylistTrack } from "../../../../src/getPlaylistTracks";
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

export default function Generate(creds: CredProps) {
  const [pl, setPl] = useState<Playlist>();
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<PlaylistTrack>();
  const [danceability, setDanceability] = useState([0, 100]);
  const [error, setError] = useState<string>();
  const updater = new Updater(creds);
  const router = useRouter();
  const { id } = router.query;
  const liked = id === "liked";

  useEffect(() => {
    setLoading(true);
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
          <h5>Danceability</h5>
          <div>
            <DoubleSliderInput value={danceability} onChange={setDanceability} min={0} max={100} />
          </div>
        </div>
      </div>
      <div className={styles.results}>
        {tracks ? <></> : <span className="error">No tracks found. Maybe try some different filters?</span>}
      </div>
    </div>
  );
}
