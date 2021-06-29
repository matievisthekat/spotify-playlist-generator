import styles from "../../styles/Result.module.sass";
import Modal from "./Modal";

interface Props extends SpotifyApi.TrackObjectFull {
  showModal: boolean;
  setShowModal(v: boolean): void;
}

export default function Result(props: Props) {
  const open = () => {
    props.setShowModal(true);
    document.querySelector("body")?.classList.add("noscroll");
  };

  const close = () => {
    props.setShowModal(false);
    document.querySelector("body")?.classList.remove("noscroll");
  };

  return (
    <>
      <Modal show={props.showModal} close={close} />
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
                <>{[prev, ", ", curr]}</>
              ))}
          </span>
        </div>
      </div>
    </>
  );
}
