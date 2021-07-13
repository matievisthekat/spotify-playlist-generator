import { ReactNode } from "react";
import styles from "../../styles/components/Playlist.module.sass";

interface Props {
  img: string | ReactNode;
  name: string;
  onClick?: () => void;
}

export default function Playlist({ img, name, onClick }: Props) {
  return (
    <div className={styles.playlist} onClick={onClick}>
      {typeof img === "string" ? (
        <img src={img} width={100} height={100} />
      ) : (
        <div className={styles.customImg}>{img}</div>
      )}
      <span>{name}</span>
    </div>
  );
}
