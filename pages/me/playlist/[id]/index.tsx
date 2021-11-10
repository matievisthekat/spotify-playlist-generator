import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import InfiniteScroll from "react-infinite-scroller";
import ExternalLink from "../../../../src/components/ExternalLink";
import Result from "../../../../src/components/Result";
import GenerateButton from "../../../../src/components/GenerateButton";
import SkeletonTrack from "../../../../src/components/SkeletonTrack";
import { CredProps, escapeHex, getCreds, requireLogin } from "../../../../src/util";
import { getAllPlaylistTracks } from "../../../../src/getPlaylistTracks";
import LikedSongs from "../../../../public/liked.png";
import styles from "../../../../styles/pages/Playlist.module.sass";

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
  const [tracks, setTracks] = useState<SpotifyApi.PlaylistTrackObject[] | SpotifyApi.SavedTrackObject[]>([]);
  const [shownTracks, setShownTracks] = useState<SpotifyApi.PlaylistTrackObject[] | SpotifyApi.SavedTrackObject[]>([]);
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
      .then((tracks) => {
        setTracks(tracks);
        setShownTracks(tracks.slice(0, 50));
      })
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
        {loading ? `Fetching playlist '${id}'...` : liked ? "Liked Songs" : pl ? pl.name : `Unknown`}
        <GenerateButton href={`/me/playlist/${id}/generate`} />
      </h2>
      {pl && (
        <span className={styles.credits}>
          Created by <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.display_name}</ExternalLink>
        </span>
      )}
      {pl && pl.description && <span>{escapeHex(pl.description)}</span>}
      {error && <span className="error">{error}</span>}
      <main>
        <div className={styles.tracks}>
          {tracks.length === pl?.tracks.total ? (
            /*
            You may be wondering why im still scroll-loading the tracks when i spent
            a lot of time making it possible to get all the tracks at once. Well
            rendering 800+ tracks litterally crashes the browser. So having all the tracks
            in memory makes sorting possible while still being useable.

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
              {shownTracks.map((t, i) => (
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
