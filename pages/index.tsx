import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.sass";

export default function Home() {
  const description = "Generate playlists based on audio features (danceability, energy,tempo, etc...)";
  const title = "Spotify Playlist Generator";

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className={styles.title}>
          <span className="accent">{title}</span>
          <p className={styles.description}>{description}</p>
        </h1>

        <div className={styles.grid}>
          <Link href="/docs">
            <div className={styles.card}>
              <h2>Documentation &rarr;</h2>
              <p>Find in-depth information about this app's functionality</p>
            </div>
          </Link>

          <div className={styles.card}>
            <a href="https://github.com/matievisthekat/spotify-playlist-generator" target="_blank">
              <h2>Code &rarr;</h2>
              <p>View the code that makes this app work!</p>
            </a>
          </div>

          <div className={styles.card}>
            <a href="https://github.com/matievisthekat/spotify-playlist-generator" target="_blank">
              <h2>Contribute &rarr;</h2>
              <p>Are you a programmer? Consider adding to this project!</p>
            </a>
          </div>

          <Link href="/login">
            <div className={styles.card}>
              <h2>Get Started &rarr;</h2>
              <p>Login and start generating playlists!</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
