import styles from "../../styles/PercentCircle.module.sass";

interface Props {
  value: number;
}

export default function PercentCircle({ value }: Props) {
  value = Math.round(value);
  return (
    <div className={`${styles.c100} ${styles[`p${value}`]} ${styles.center}`}>
      <span>{value}%</span>
      <div className={styles.slice}>
        <div className={styles.bar}></div>
        <div className={styles.fill}></div>
      </div>
    </div>
  );
}
