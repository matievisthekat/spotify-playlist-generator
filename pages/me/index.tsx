import { useEffect, useState, forwardRef } from "react";
import Link from "next/link";
import Updater from "spotify-oauth-refresher";
import { DebounceInput } from "react-debounce-input";
import InfiniteScroll from "react-infinite-scroller";
import { ScaleLoader } from "react-spinners";
import Result from "../../src/components/Result";
import Playlist from "../../src/components/Playlist";
import ExternalLink from "../../src/components/ExternalLink";
import { CredProps, getCreds, requireLogin } from "../../src/util";
import styles from "../../styles/pages/Me.module.sass";

const PlaylistWithRef = forwardRef(Playlist);

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Me({ clientId, clientSecret, authUrl }: CredProps) {
  const updater = new Updater({ clientId, clientSecret });
  const [error, setError] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<SpotifyApi.TrackObjectFull[]>();
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistObjectFull[]>();
  const [showMorePl, setShowMorePl] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const initialPlaylists = 2;

  const search = (offset: number) => {
    updater
      .request<SpotifyApi.TrackSearchResponse>({
        url: "https://api.spotify.com/v1/search",
        params: {
          type: "track",
          q: query,
          offset,
        },
        authType: "bearer",
      })
      .then(({ data }) => {
        if (data.tracks.items.length <= 0) setHasMore(false);
        if (offset !== 0 && results && data.tracks.items.length > 0) {
          setResults([...results, ...data.tracks.items]);
        } else setResults(data.tracks.items);
      })
      .catch((err) => setSearchErr(err.message));
  };

  useEffect(() => {
    requireLogin(updater, authUrl);

    updater
      .request({
        url: "https://api.spotify.com/v1/me",
        authType: "bearer",
      })
      .then(({ data }) => {
        setUsername(data.id);

        updater
          .request({
            url: "https://api.spotify.com/v1/me/playlists",
            authType: "bearer",
          })
          .then(({ data }) => setPlaylists(data.items))
          .catch((err) => setError(err.message));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (query) {
      search(0);
    }
  }, [query]);

  const loadMore = (page: number) => {
    search(20 * page);
  };

  return (
    <div className="container">
      <h2>
        Hello,&nbsp;
        <ExternalLink href={`https://open.spotify.com/user/${username}`}>{username}</ExternalLink>
      </h2>

      {error ? (
        <span className="error">{error}</span>
      ) : (
        <>
          <main>
            <span style={{ marginBottom: "1rem" }}>Choose a base playlist to generate from</span>
            <div className={styles.playlists}>
              <Link href="/me/playlist/liked" passHref>
                <PlaylistWithRef img="/liked.png" name="Liked Songs" />
              </Link>
              {playlists && (
                <>
                  {(showMorePl ? playlists : playlists.slice(0, initialPlaylists)).map((p, i) => (
                    <Link href={`/me/playlist/${p.id}`} key={i} passHref>
                      <PlaylistWithRef img={p.images[0].url} name={p.name} />
                    </Link>
                  ))}
                  {playlists.length > initialPlaylists && (
                    <Playlist
                      img={
                        <span style={{ fontSize: "4.5rem" }}>{`${showMorePl ? "-" : "+"}${
                          playlists.length - initialPlaylists
                        }`}</span>
                      }
                      name={`View ${playlists.length - initialPlaylists} ${showMorePl ? "less" : "more"}`}
                      onClick={() => setShowMorePl(!showMorePl)}
                    />
                  )}
                </>
              )}
            </div>

            <span style={{ marginBottom: "1.8rem" }}>Or search for songs and view their audio features</span>
            <DebounceInput
              type="text"
              minLength={3}
              debounceTimeout={500}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ marginBottom: "2rem" }}
            />

            {searchErr && (
              <span className="error" style={{ marginBottom: "1rem" }}>
                {searchErr}
              </span>
            )}

            <div className={styles.container}>
              {results && (
                <InfiniteScroll
                  pageStart={0}
                  hasMore={hasMore}
                  loadMore={loadMore}
                  loader={
                    <div style={{ textAlign: "center" }}>
                      <ScaleLoader loading={true} color="#1DB954" />
                    </div>
                  }
                >
                  {results.map((t, i) => (
                    <Result
                      key={i}
                      updater={updater}
                      showModal={i === modal}
                      setShowModal={(v: boolean) => setModal(v ? i : -1)}
                      track={t}
                    />
                  ))}
                </InfiniteScroll>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
