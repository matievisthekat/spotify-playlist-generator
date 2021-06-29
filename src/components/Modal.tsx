import { MutableRefObject, ReactNode, useEffect, useRef } from "react";
import styles from "../../styles/Modal.module.sass";

interface Props {
  show?: boolean;
  close(): void;
  children: ReactNode;
}

function useCloseListener(ref: MutableRefObject<any>, close: () => void) {
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target)) close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export default function Modal({ show, close, children }: Props) {
  const wrapper = useRef(null);
  useCloseListener(wrapper, close);

  return show ? (
    <div className={styles.modal} ref={wrapper}>
      <span className={styles.close} onClick={() => close()}>
        &times;
      </span>
      {children}
    </div>
  ) : null;
}
