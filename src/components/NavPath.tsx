import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../../styles/NavPath.module.sass";

export default function NavPath() {
  const [paths, setPaths] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", () => update());
    update();
  }, []);

  const update = () => {
    const name = window.location.pathname;
    setPaths([
      "Home",
      ...name
        .split("/")
        .filter((n) => n.length > 0)
        .map((n) =>
          n
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1, w.length))
            .join(" ")
        ),
    ]);
  };

  return (
    <div className={styles.nav}>
      {paths.map((p, i) => (
        <span key={i}>
          <span className={styles.seperator}>/</span>
          <Link href={`/${p === "Home" ? "" : p.toLowerCase().replace(" ", "-")}`}>
            <span className={styles.part}>{p}</span>
          </Link>
        </span>
      ))}
    </div>
  );
}
