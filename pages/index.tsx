import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Updater from "spotify-oauth-refresher";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { CredProps, getCreds } from "../src/util";
import styles from "../styles/pages/Home.module.sass";

export async function getStaticProps() {
  return {
    props: getCreds(),
  };
}

export default function Home({ clientId, clientSecret }: CredProps) {
  const updater = new Updater({ clientId, clientSecret });
  const description = "Generate playlists based on audio features (danceability, energy,tempo, etc...)";
  const title = "Spotify Playlist Generator";

  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => setLoggedIn(!!updater.refreshToken), []);

  return (
    <div className="container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <main>
        <h1 className={styles.title}>
          <span className="accent">{title}</span>
          <p className={styles.description}>{description}</p>
        </h1>

        <div className="grid">
          <Link href="/docs" passHref>
            <div className={styles.card}>
              <h2>Documentation <ArrowForwardIcon /></h2>
              <p>Find in-depth information about this app&apos;s functionality</p>
            </div>
          </Link>

          <div className={styles.card}>
            <a href="https://github.com/matievisthekat/spotify-playlist-generator" target="_blank" rel="noreferrer">
              <h2>Code <ArrowForwardIcon /></h2>
              <p>View the code that makes this app work!</p>
            </a>
          </div>

          <Link href="/categories" passHref>
            <div className={styles.card}>
              <h2>Categories <ArrowForwardIcon /></h2>
              <p>Check out the types of music each playlist is made up of</p>
            </div>
          </Link>

          {loggedIn ? (
            <Link href="/me" passHref>
              <div className={styles.card}>
                <h2>
                  Hello again <ArrowForwardIcon />
                </h2>
                <p>Start generating playlists!</p>
              </div>
            </Link>
          ) : (
            <Link href="/login" passHref>
              <div className={styles.card}>
                <h2>Get Started <ArrowForwardIcon /></h2>
                <p>Login and start generating playlists!</p>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
