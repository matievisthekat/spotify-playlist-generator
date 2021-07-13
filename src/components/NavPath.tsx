import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toProperCase } from "../util";
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
    setPaths([
      "Home",
      ...name
        .split("/")
        .filter((n) => n.length > 0)
        .map((n) => toProperCase(n.split("-").join(" "))),
    ]);
  };

  return (
    <div className={styles.nav}>
      {paths.map((path, i) => (
        <span key={i}>
          <span className={styles.seperator}>/</span>
          <Link
            href={`/${
              path === "Home"
                ? ""
                : paths
                    .slice(1, i + 1)
                    .map((p) => p.toLowerCase().replace(" ", "-"))
                    .join("/")
            }`}
          >
            <span className={styles.part}>{path}</span>
          </Link>
        </span>
      ))}
    </div>
  );
}
