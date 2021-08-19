import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/components/NavPath.module.sass";

export default function NavPath() {
  const [paths, setPaths] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", () => update());
    update();
  }, []);

  const update = () => {
    const name = window.location.pathname;
    setPaths(["home", ...name.split("/").filter((n) => n.length > 0)]);
  };

  return (
    <div className={styles.nav}>
      {paths.map((path, i) => (
        <span key={i}>
          <span className={styles.seperator}>/</span>
          <Link passHref href={`/${path === "home" ? "" : paths.slice(1, i + 1).join("/")}`}>
            <span className={styles.part}>{path}</span>
          </Link>
        </span>
      ))}
    </div>
  );
}
