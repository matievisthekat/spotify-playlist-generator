import { useState, MouseEvent as ReactMousEvent } from "react";
import { ScaleLoader } from "react-spinners";
import Updater from "spotify-oauth-refresher";
import { nanoid } from "nanoid";
import moment from "moment";
import FeatureDisplay from "./FeatureDisplay";
import ExplicitIcon from "./ExplicitIcon";
import Modal from "./Modal";
import { categories, CategoryName, toProperCase } from "../util";
import styles from "../../styles/components/Result.module.sass";

enum Tempo {
  "LIGHT_SPEED",
  "VERY_FAST",
  "FAST",
  "MODERATE",
  "SLOW",
  "VERY_SLOW",
}

interface Props extends Omit<SpotifyApi.PlaylistTrackObject, "is_local" | "added_by" | "added_at"> {
  showModal: boolean;
  setShowModal(v: boolean): void;
  updater: Updater;
  added_at?: string;
  added_by?: SpotifyApi.UserObjectPublic;
  is_local?: boolean;
  compact?: boolean;
}

interface OnClickEvent extends ReactMousEvent<HTMLDivElement> {
  target: HTMLElement;
}

export default function Result({ compact, added_at, added_by, track, updater, showModal, setShowModal }: Props) {
  const [features, setFeatures] = useState<SpotifyApi.AudioFeaturesObject>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const open = (e: OnClickEvent) => {
    if (
      !e.target.classList.contains(styles.result) &&
      !e.target.classList.contains(styles.plInfo) &&
      !e.target.classList.contains(styles.artists) &&
      !e.target.classList.contains(styles.title)
    )
      return;

    setShowModal(true);
    document.querySelector("body")?.classList.add("noscroll");

    if (!features) {
      setLoading(true);
      updater
        .request({
          url: `https://api.spotify.com/v1/audio-features/${track.id}`,
          authType: "bearer",
        })
        .then(({ data }) => setFeatures(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  const close = () => {
    setShowModal(false);
    document.querySelector("body")?.classList.remove("noscroll");
  };

  return (
    <>
      <Modal show={showModal} close={close}>
        <h4>{track.name}</h4>
        {error && <span className="error">{error}</span>}
        {loading ? (
          <span className={styles.loader}>
            <ScaleLoader loading={loading} color="#1DB954" />
          </span>
        ) : features ? (
          <div className={styles.features}>
            {Object.entries(categories).map((f, i) => {
              const info = categories[f[0] as CategoryName];

              if (f[0] === "tempo") {
                return (
                  <FeatureDisplay
                    title="Tempo"
                    displayLike="text"
                    text={Tempo[tempo ?? -1].replace("_", "")}
                    className={typeof tempo === "number" ? styles[`tempo__${Tempo[tempo]}`] : undefined}
                    infoText={info}
                    key={i}
                  />
                );
              } else {
                return (
                  <FeatureDisplay
                    title={toProperCase(f[0]).replace(/(iness|ness)$/g, "")}
                    displayLike="number"
                    value={(features[f[0] as CategoryName] as number) * 100}
                    infoText={info}
                    key={i}
                  />
                );
              }
            })}
          </div>
        ) : null}
      </Modal>
      <div className={`${styles.result} ${compact ? styles.compact : styles.normal}`} onClick={open}>
        <img src={track.album.images[0].url} width={compact ? 50 : 100} alt="Track album cover image" />
        {added_at && (
          <span className={styles.plInfo}>
            <small>
              {moment(added_at).fromNow()}
              &nbsp;<strong>-</strong>&nbsp;
              <a href={added_by?.external_urls.spotify} className={styles.link} target="_blank" rel="noreferrer">
                {added_by?.id || "you"}
              </a>
            </small>
          </span>
        )}
        <span className={styles.title}>
          <a href={track.external_urls.spotify} target="_blank" rel="noreferrer">
            {track.name}
          </a>
        </span>
        <span className={styles.artists}>
          {track.explicit && <ExplicitIcon />}
          {track.artists
            .map((a, i) => (
              <small key={i}>
                <a href={a.external_urls.spotify} className={styles.link} target="_blank" rel="noreferrer">
                  {a.name}
                </a>
              </small>
            ))
            .reduce((prev, curr) => (
              <>{[prev, <span key={nanoid()}>, </span>, curr]}</>
            ))}
        </span>
      </div>
    </>
  );
}
