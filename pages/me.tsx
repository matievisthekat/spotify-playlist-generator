import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import { getCreds } from "../src/util";

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
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const updater = new Updater({ clientId: id, clientSecret: secret });

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

  return (
    <div className="container">
      {error ? (
        <span className="error">{error}</span>
      ) : (
        <a href={url} className="link" target="_blank">
          <h2>{username}</h2>
        </a>
      )}
    </div>
  );
}
