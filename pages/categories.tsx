import Seo from "../src/components/Seo";
import { categories, toProperCase } from "../src/util";
import styles from "../styles/pages/Categories.module.sass";

export default function Categories() {
  return (
    <div className="container">
      <Seo title="Categories" />

      <main>
        <h1 className={styles.title}>
          <span className="accent">Categories</span>
          <p className={styles.description}>Playlists are created from these categories of music</p>
        </h1>

        <div className="grid">
          {Object.entries(categories).map((c, i) => (
            <div className={styles.card} key={i}>
              <h2>{toProperCase(c[0])}</h2>
              <p>{c[1]}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
