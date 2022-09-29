import { useEffect, useState, forwardRef } from "react";
import Link from "next/link";
import Updater from "spotify-oauth-refresher";
import axios from "axios";
import { DebounceInput } from "react-debounce-input";
import InfiniteScroll from "react-infinite-scroller";
import { ScaleLoader } from "react-spinners";
import Result from "../../src/components/Result";
import Playlist from "../../src/components/Playlist";
import ExternalLink from "../../src/components/ExternalLink";
import styles from "../../styles/pages/Me.module.sass";
import { ApiMeResponse } from "../api/me";
import { ApiSearchResponse } from "../api/me/search";

const PlaylistWithRef = forwardRef(Playlist);

export default function Me() {
  const [me, setMe] = useState<SpotifyApi.CurrentUsersProfileResponse>();
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistObjectSimplified[]>([]);
  const [error, setError] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [results, setResults] = useState<(SpotifyApi.TrackObjectFull & { audio_features: SpotifyApi.AudioFeaturesObject })[]>();
  const [showMorePl, setShowMorePl] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [updater, setUpdater] = useState<Updater>();
  const initialPlaylists = 2;
  const username = me?.id;

  const search = (offset: number) => {
    axios.get<ApiSearchResponse>("/api/me/search", {
      params: {
        query,
        offset,
      }
    })
      .then(({ data }) => {
        if (data.tracks.length <= 0) setHasMore(false);
        if (offset !== 0 && results && data.tracks.length > 0) {
          setResults([...results, ...data.tracks]);
        } else setResults(data.tracks);
      })
      .catch((err) => {
        console.error(err);
        setSearchErr(err.message);
      });
  };

  useEffect(() => {
    axios.get<ApiMeResponse>("/api/me")
      .then((res) => {
        setMe(res.data.me);
        setPlaylists(res.data.playlists);

        const { clientId, clientSecret } = res.data;
        setUpdater(new Updater({ clientId, clientSecret }));
      }).catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  useEffect(() => {
    if (query) {
      console.log(typeof search);
      if (typeof search === "function") search(0);
    }
  }, [query]);

  const loadMore = (page: number) => {
    if (typeof search === "function") search(20 * page);
  };

  return (
    <div className="container">
      <h2>
        Hello,&nbsp;
        <ExternalLink href={`https://open.spotify.com/user/${username}`}>{username}</ExternalLink>
      </h2>

      <span className="link"><Link href="/logout">Not you? Log out</Link></span>

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
                      img={<span style={{ fontSize: "4.5rem" }}>{showMorePl ? "-" : "+"}</span>}
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
              {results && results.length > 0 ? (
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
                  {updater && results.map((t, i) => (
                    <Result
                      key={i}
                      updater={updater}
                      showModal={i === modal}
                      setShowModal={(v: boolean) => setModal(v ? i : -1)}
                      track={t}
                      features={t.audio_features}
                    />
                  ))}
                </InfiniteScroll>
              ) : (
                <div style={{ marginBottom: "30px" }}>no results</div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
