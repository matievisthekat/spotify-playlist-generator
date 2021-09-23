import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
import GenerateButton from "../../../../src/components/GenerateButton";
import { CredProps, getCreds, requireLogin } from "../../../../src/util";
import LikedSongs from "../../../../public/liked.png";
import styles from "../../../../styles/pages/Playlist.module.sass";
import { getAllPlaylistTracks } from "../../../../src/getPlaylistTracks";
import SkeletonTrack from "../../../../src/components/SkeletonTrack";

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
  const [pl, setPl] = useState<SpotifyApi.SinglePlaylistResponse>();
  const [tracks, setTracks] = useState<SpotifyApi.PlaylistTrackObject[] | SpotifyApi.SavedTrackObject[]>();
  const [modal, setModal] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const id = router.query.id as string;
  const liked = id === "liked";

  useEffect(() => {
    requireLogin(updater, authUrl);

    if (!liked) {
      updater
        .request<SpotifyApi.SinglePlaylistResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}`,
          authType: "bearer",
        })
        .then(({ data }) => setPl(data))
        .catch((err) => setError(err.message));
    }

    getAllPlaylistTracks(updater, id)
      .then((tracks) => setTracks(tracks))
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
      {liked && (
        <span className={styles.cover}>
          <Image src={LikedSongs} width={200} height={200} alt="Liked songs cover" />
        </span>
      )}
      <h2>
        {loading ? `Fetching playist '${id}'...` : liked ? "Liked Songs" : pl ? pl.name : `Unknown`}
        <GenerateButton href={`/me/playlist/${id}/generate`} />
      </h2>
      {pl && (
        <span className={styles.credits}>
          Created by <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.id}</ExternalLink>
        </span>
      )}
      {pl && <span>{pl.description}</span>}
      {error && <span className="error">{error}</span>}
      <main>
        <div className={styles.tracks}>
          {tracks
            ? tracks.map((t, i) => (
                <Result
                  {...t}
                  setShowModal={(v: boolean) => setModal(v ? i : -1)}
                  showModal={modal === i}
                  updater={updater}
                  key={i}
                  compact
                />
              ))
            : new Array(10).fill(null).map((_, i) => <SkeletonTrack key={i} />)}
        </div>
      </main>
    </div>
  );
}
