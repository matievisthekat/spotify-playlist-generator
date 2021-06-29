import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import { getCreds } from "../src/util";
import { DebounceInput } from "react-debounce-input";
import Result from "../src/components/Result";
import styles from "../styles/Me.module.sass";

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
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SpotifyApi.TrackSearchResponse>();

  useEffect(() => {
    updater
      .request({
        url: "https://api.spotify.com/v1/me",
        authType: "bearer",
      })
      .then(({ data }) => {
        setUsername(data.id);
        setUrl(data.external_urls.spotify);
      })
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
      {error ? (
        <span className="error">{error}</span>
      ) : (
        <>
          <h2>
            Hello,&nbsp;
            <a href={url} className="link" target="_blank">
              {username}
            </a>
          </h2>

          <main>
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
              {result && result.tracks.items.map((t, i) => <Result {...t} key={i} />)}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
