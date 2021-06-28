import Seo from "../src/components/Seo";
import styles from "../styles/Categories.module.sass";
import { categories } from "../src/util";

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
          {categories.map((c, i) => (
            <div className={styles.card} key={i}>
              <h2>{c.name}</h2>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
