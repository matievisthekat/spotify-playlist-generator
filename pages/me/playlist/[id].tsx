import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import ExternalLink from "../../../src/components/ExternalLink";
import Result from "../../../src/components/Result";
import { CredProps, getCreds, requireLogin } from "../../../src/util";
import LikedSongs from "../../../public/liked-songs.png";
import styles from "../../../styles/pages/Playlist.module.sass";

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

export default function Playlist({ clientId, clientSecret, authUrl }: CredProps) {
  const updater = new Updater({ clientId, clientSecret });
  const [pl, setPl] = useState<SpotifyApi.PlaylistObjectFull>();
  const [liked, setLiked] = useState<SpotifyApi.SavedTrackObject[]>();
  const [modal, setModal] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = router.query;
  const likedSongs = id === "liked-songs";

  useEffect(() => {
    requireLogin(updater, authUrl);

    updater
      .request({
        url: likedSongs ? "https://api.spotify.com/v1/me/tracks" : `https://api.spotify.com/v1/playlists/${id}`,
        authType: "bearer",
      })
      .then(({ data }) => (likedSongs ? setLiked(data.items) : setPl(data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      {pl && (
        <span className={styles.cover}>
          <img src={pl.images[0].url} width={200} height={200} alt="Playlist cover image" />
        </span>
      )}
      {likedSongs && (
        <span className={styles.cover}>
          <Image src={LikedSongs} width={200} height={200} alt="Liked songs cover" />
        </span>
      )}
      <h2>
        {loading
          ? `Fetching playist ${id}...`
          : liked
          ? "Liked Songs"
          : pl
          ? pl.name
          : `Failed to fetch playlist ${id}`}
      </h2>
      {pl && (
        <span className={styles.credits}>
          Created by <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.id}</ExternalLink>
        </span>
      )}
      {error && <span className="error">{error}</span>}
      {pl && (
        <div className={styles.tracks}>
          {pl.tracks.items.map((t, i) => (
            <Result
              {...t}
              setShowModal={(v: boolean) => setModal(v ? i : -1)}
              showModal={modal === i}
              updater={updater}
              key={i}
              compact
            />
          ))}
        </div>
      )}
      {liked && (
        <div className={styles.tracks}>
          {liked.map((t, i) => (
            <Result
              {...t}
              setShowModal={(v: boolean) => setModal(v ? i : -1)}
              showModal={modal === i}
              updater={updater}
              key={i}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
