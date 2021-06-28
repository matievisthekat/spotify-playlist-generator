import Head from "next/head";

interface Props {
  title?: string;
  desc?: string;
  icon?: string;
}

export default function Seo({ title, desc, icon }: Props) {
  return (
    <Head>
      <title>{title ? `${title} | Spotify Playlist Generator` : "Spotify Playlist Generator"}</title>
      <link rel="icon" href={icon || "/favicon.ico"} />
      <meta
        name="description"
        content={desc || "Generate playlists based on song features (danceability, energy, positivity, etc...)"}
      />
    </Head>
  );
}
