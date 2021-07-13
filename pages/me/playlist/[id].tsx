import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import ExternalLink from "../../../src/components/ExternalLink";
import { CredProps, getCreds } from "../../../src/util";
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

export default function Playlist({ clientId, clientSecret }: CredProps) {
  const updater = new Updater({ clientId, clientSecret });
  const [pl, setPl] = useState<SpotifyApi.PlaylistObjectFull>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    updater
      .request({
        url: `https://api.spotify.com/v1/playlists/${id}`,
        authType: "bearer",
      })
      .then(({ data }) => setPl(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      {pl && <img style={{ marginTop: "3rem" }} src={pl.images[0].url} width={200} />}
      <h2>{loading ? `Fetching playist ${id}...` : pl ? pl.name : `Failed to fetch playlist ${id}`}</h2>
      {pl && (
        <span className={styles.credits}>
          Created by <ExternalLink href={pl.owner.external_urls.spotify}>{pl.owner.display_name}</ExternalLink>
        </span>
      )}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
