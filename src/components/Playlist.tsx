import styles from "../../styles/components/Playlist.module.sass";

interface Props {
  img: string;
  name: string;
}

export default function Playlist({ img, name }: Props) {
  return (
    <div className={styles.playlist}>
      <img src={img} width={100} height={100} />
      <span>{name}</span>
    </div>
  );
}
