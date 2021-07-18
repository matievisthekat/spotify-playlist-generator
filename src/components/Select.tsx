import { useEffect, useState } from "react";
import styles from "../../styles/components/Select.module.sass";
import { removeEl } from "../util";

interface Props {
  onChange: (v: string) => void;
  formatOption?: (o: string) => string;
  options: string[];
}

export default function Select({ options, onChange, formatOption = (o) => o }: Props) {
  const [current, setCurrent] = useState(options[0]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => onChange(current), [current]);

  return (
    <ul
      className={styles.select}
      onClick={(e) => {
        if (e.currentTarget.classList.contains(styles.select)) setShowOptions(!showOptions);
      }}
    >
      <span>{formatOption(current)}</span>
      {showOptions &&
        removeEl(options, current).map((o, i) => (
          <li onClick={() => setCurrent(o)} key={i}>
            {formatOption(o)}
          </li>
        ))}
    </ul>
  );
}
