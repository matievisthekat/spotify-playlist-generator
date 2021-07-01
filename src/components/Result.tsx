import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import Updater from "spotify-oauth-refresher";
import { nanoid } from "nanoid";
import Modal from "./Modal";
import FeatureDisplay from "./FeatureDisplay";
import styles from "../../styles/Result.module.sass";

enum Tempo {
  "LIGHT_SPEED",
  "VERY_FAST",
  "FAST",
  "MODERATE",
  "SLOW",
  "VERY_SLOW",
}

interface Props extends SpotifyApi.TrackObjectFull {
  showModal: boolean;
  setShowModal(v: boolean): void;
  updater: Updater;
}

export default function Result(props: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [features, setFeatures] = useState<SpotifyApi.AudioFeaturesObject>();

  const showFeatures: (keyof SpotifyApi.AudioFeaturesObject)[] = [
    "danceability",
    "acousticness",
    "energy",
    "instrumentalness",
    "liveness",
    "speechiness",
    "valence",
  ];

  let tempo: Tempo | null = null;
  if (features) {
    const { tempo: t } = features;
    if (t > 200) tempo = 0;
    else if (t > 160) tempo = 1;
    else if (t > 120) tempo = 2;
    else if (t > 80) tempo = 3;
    else if (t > 40) tempo = 4;
    else tempo = 5;
  }

  const open = () => {
    props.setShowModal(true);
    document.querySelector("body")?.classList.add("noscroll");

    if (!features) {
      setLoading(true);
      props.updater
        .request({
          url: `https://api.spotify.com/v1/audio-features/${props.id}`,
          authType: "bearer",
        })
        .then(({ data }) => setFeatures(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  const close = () => {
    props.setShowModal(false);
    document.querySelector("body")?.classList.remove("noscroll");
  };

  return (
    <>
      <Modal show={props.showModal} close={close}>
        <h4>{props.name}</h4>
        {error && <span className="error">{error}</span>}
        {loading ? (
          <span className={styles.loader}>
            <ScaleLoader loading={loading} color="#1DB954" />
          </span>
        ) : features ? (
          <div className={styles.features}>
            {showFeatures.map((f, i) => (
              <FeatureDisplay
                title={(f.charAt(0).toUpperCase() + f.slice(1, f.length)).replace(/(iness|ness)$/g, "")}
                displayLike="number"
                value={(features[f] as number) * 100}
                key={i}
              />
            ))}
            <FeatureDisplay
              title="Tempo"
              displayLike="text"
              text={Tempo[tempo || -1].replace("_", " ")}
              className={tempo ? styles[`tempo__${Tempo[tempo]}`] : undefined}
            />
          </div>
        ) : null}
      </Modal>
      <div className={styles.result} onClick={open}>
        <img src={props.album.images[0].url} width={100} height={100} />
        <div>
          <span className={styles.title}>
            <a href={props.external_urls.spotify} target="_blank">
              {props.name}
            </a>
          </span>
          <span>
            {props.artists
              .map((a, i) => (
                <small key={i}>
                  <a href={a.external_urls.spotify} className={styles.link} target="_blank">
                    {a.name}
                  </a>
                </small>
              ))
              .reduce((prev, curr) => (
                <>{[prev, <span key={nanoid()}>, </span>, curr]}</>
              ))}
          </span>
        </div>
      </div>
    </>
  );
}
