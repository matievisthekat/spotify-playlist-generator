import { useEffect, useState } from "react";
import Link from "next/link";
import Updater from "spotify-oauth-refresher";
import { DebounceInput } from "react-debounce-input";
import Result from "../src/components/Result";
import Playlist from "../src/components/Playlist";
import { getCreds } from "../src/util";
import styles from "../styles/pages/Me.module.sass";

interface Props {
  id: string;
  secret: string;
}

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Me({ id, secret }: Props) {
  const updater = new Updater({ clientId: id, clientSecret: secret });
  const [error, setError] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<SpotifyApi.TrackSearchResponse>();
  const [playlists, setPlaylists] = useState<SpotifyApi.PlaylistObjectFull[]>();
  const [showMorePl, setShowMorePl] = useState(false);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(-1);
  const initialPlaylists = 2;

  useEffect(() => {
    updater
      .request({
        url: "https://api.spotify.com/v1/me",
        authType: "bearer",
      })
      .then(({ data }) => setUsername(data.id))
      .catch((err) => setError(err.message));

    updater
      .request({
        url: "https://api.spotify.com/v1/me/playlists",
        authType: "bearer",
      })
      .then(({ data }) => setPlaylists(data.items))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (query) {
      updater
        .request({
          url: "https://api.spotify.com/v1/search",
          params: {
            type: "track",
            q: query,
            limit: 30,
            offset: 0,
          },
          authType: "bearer",
        })
        .then((res) => setResult(res.data))
        .catch((err) => setSearchErr(err.message));
    }
  }, [query]);

  return (
    <div className="container">
      <h2>
        Hello,&nbsp;
        <a href={`https://open.spotify.com/user/${username}`} className="link" target="_blank">
          {username}
        </a>
      </h2>

      {error ? (
        <span className="error">{error}</span>
      ) : (
        <>
          <main>
            <div className={styles.playlists}>
              <Playlist img="/liked-songs.png" name="Liked Songs" />
              {playlists && (
                <>
                  {(showMorePl ? playlists : playlists.slice(0, initialPlaylists)).map((p, i) => (
                    <Link href={`/me/playlist/${p.id}`}>
                      <Playlist key={i} img={p.images[0].url} name={p.name} />
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

            <span style={{ marginBottom: "1rem" }}>Search for songs and view their audio features</span>
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
              {result &&
                result.tracks.items.map((t, i) => (
                  <Result
                    updater={updater}
                    key={i}
                    showModal={i === modal}
                    setShowModal={(v: boolean) => setModal(v ? i : -1)}
                    {...t}
                  />
                ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
