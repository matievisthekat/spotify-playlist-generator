import styles from "../../styles/Modal.module.sass";

interface Props {
  show?: boolean;
  close(): void;
}

export default function Modal({ show, close }: Props) {
  return show ? (
    <div className={styles.container} onClick={() => close()}>
      <div className={styles.modal}>
        <span className={styles.close} onClick={() => close()}>
          &times;
        </span>
        &nbsp;
      </div>
    </div>
  ) : null;
}
