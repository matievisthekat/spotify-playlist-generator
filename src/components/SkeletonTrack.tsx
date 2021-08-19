import Skeleton from "@material-ui/lab/Skeleton";
import styles from "../../styles/components/Result.module.sass";

export default function SkeletonTrack() {
  return (
    <div className={`${styles.result} ${styles.shadow} ${styles.compact}`}>
      <div className={styles.img}>
        <Skeleton variant="rect" width={50} height={50} animation="wave" />
      </div>
      <span className={styles.title}>
        <Skeleton variant="text" width="50%" animation="wave" />
      </span>
      <span className={styles.artists}>
        <Skeleton variant="text" width="30%" animation="wave" />
      </span>
    </div>
  );
}
