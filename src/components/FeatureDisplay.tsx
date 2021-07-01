import { useState } from "react";
import PercentCircle from "./PercentCircle";
import styles from "../../styles/FeatureDisplay.module.sass";

interface Props {
  title: string;
  displayLike: "number" | "text";
  text?: string;
  value?: number;
  infoText?: string;
  className?: string;
}

export default function FeatureDisplay({ title, displayLike, text, value, infoText, className }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={styles.display} onClick={() => setShowInfo(!showInfo)}>
      <div className={styles.body}>
        <span>{title}</span>
        {displayLike === "number" ? <PercentCircle value={value || 0} /> : <h1 className={className}>{text}</h1>}
      </div>
      {infoText && <div className={`${styles.info} ${showInfo ? styles.show : ""}`}>{infoText}</div>}
    </div>
  );
}
