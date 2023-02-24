import { ReactNode, Ref } from "react";
import styles from "../../styles/components/Playlist.module.sass";

interface Props {
  img: string | ReactNode;
  name: string;
  onClick?: () => void;
}

export default function Playlist({ img, name, onClick }: Props, ref?: Ref<HTMLDivElement>) {
  return (
    <div className={styles.playlist} onClick={onClick}>
      {typeof img === "string" ? (
        <img className={styles.img} src={img} width={100} alt="Playlist cover image" />
      ) : (
        <div className={styles.customImg}>{img}</div>
      )}
      <span>{name}</span>
    </div>
  );
}
