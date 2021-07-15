import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import InfiniteScroll from "react-infinite-scroller";
import { ScaleLoader } from "react-spinners";
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
  const [pl, setPl] = useState<SpotifyApi.SinglePlaylistResponse>();
  const [tracks, setTracks] = useState<SpotifyApi.PlaylistTrackObject[]>();
  const [liked, setLiked] = useState<SpotifyApi.SavedTrackObject[]>();
  const [modal, setModal] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = router.query;
  const likedSongs = id === "liked-songs";

  console.log(liked?.length, tracks?.length);

  const getTracks = (offset: number) => {
    if (likedSongs) {
      updater
        .request<SpotifyApi.UsersSavedTracksResponse>({
          url: "https://api.spotify.com/v1/me/tracks",
          params: { offset, limit: 50 },
          authType: "bearer",
        })
        .then(({ data }) => {
          if (data.items.length <= 0) setHasMore(false);
          if (offset !== 0 && liked && data.items.length > 0) setLiked([...liked, ...data.items]);
          else setLiked(data.items);
        })
        .catch((err) => setError(err.message));
    } else {
      updater
        .request<SpotifyApi.PlaylistTrackResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}/tracks`,
          params: { offset, limit: 50 },
          authType: "bearer",
        })
        .then(({ data }) => {
          if (data.items.length <= 0) setHasMore(false);
          if (offset !== 0 && tracks && data.items.length > 0) setTracks([...tracks, ...data.items]);
          else setTracks(data.items);
        })
        .catch((err) => setError(err.message));
    }
  };

  const loadMore = (page: number) => getTracks(50 * page);

  useEffect(() => {
    requireLogin(updater, authUrl);

    if (!likedSongs) {
      updater
        .request<SpotifyApi.SinglePlaylistResponse>({
          url: `https://api.spotify.com/v1/playlists/${id}`,
          authType: "bearer",
        })
        .then(({ data }) => setPl(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }

    getTracks(0);
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
      {(tracks || liked) && (
        <div className={styles.tracks}>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: "center" }}>
                <ScaleLoader loading={true} color="#1DB954" />
              </div>
            }
          >
            {tracks &&
              tracks.map((t, i) => (
                <Result
                  {...t}
                  setShowModal={(v: boolean) => setModal(v ? i : -1)}
                  showModal={modal === i}
                  updater={updater}
                  key={i}
                  compact
                />
              ))}
            {liked &&
              liked.map((t, i) => (
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
        </div>
      )}
    </div>
  );
}
