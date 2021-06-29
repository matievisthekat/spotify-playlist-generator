import styles from "../../styles/Result.module.sass";

export default function Result(props: SpotifyApi.TrackObjectFull) {
  const onClick = () => {};

  return (
    <div className={styles.result} onClick={onClick}>
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
              <>{[prev, <span>, </span>, curr]}</>
            ))}
        </span>
      </div>
    </div>
  );
}
