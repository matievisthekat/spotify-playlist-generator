import { useState } from "react";
import { ScaleLoader } from "react-spinners";
import Updater from "spotify-oauth-refresher";
import { nanoid } from "nanoid";
import Modal from "./Modal";
import PercentCircle from "./PercentCircle";
import styles from "../../styles/Result.module.sass";

interface Props extends SpotifyApi.TrackObjectFull {
  showModal: boolean;
  setShowModal(v: boolean): void;
  updater: Updater;
}

export default function Result(props: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [features, setFeatures] = useState<SpotifyApi.AudioFeaturesObject>();

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
            <div>
              <span>Danceability</span>
              <div>
                <PercentCircle value={features.danceability * 100} />
              </div>
            </div>

            <div>
              <span>Acousticness</span>
              <div>{features.acousticness}</div>
            </div>

            <div>
              <span>Energy</span>
              <div>{features.energy}</div>
            </div>

            <div>
              <span>Instrumentalness</span>
              <div>{features.instrumentalness}</div>
            </div>

            <div>
              <span>Liveness</span>
              <div>{features.liveness}</div>
            </div>

            <div>
              <span>Speechiness</span>
              <div>{features.speechiness}</div>
            </div>

            <div>
              <span>Tempo</span>
              <div>{features.tempo}</div>
            </div>

            <div>
              <span>Valence</span>
              <div>{features.valence}</div>
            </div>
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
