import { useEffect } from "react";
import { scope } from "../src/util";

interface Props {
  url: string;
}

export async function getStaticProps() {
  return {
    props: {
      url: `https://accounts.spotify.com/authorize?response_type=code&client_id=76d4b7cc92a94b3197de9a8036bd64e1&scope=${encodeURIComponent(
        scope.join(" ")
      )}&redirect_uri=${process.env.REDIRECT_URI}&show_dialog=true`,
    },
  };
}

export default function Login({ url }: Props) {
  useEffect(() => {
    window.location.href = url;
  }, []);

  return (
    <div className="container">
      <main>
        <h1>Redirecting...</h1>
      </main>
    </div>
  );
}
