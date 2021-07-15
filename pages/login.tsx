import { useEffect } from "react";
import { getCreds, scope } from "../src/util";

interface Props {
  url: string;
}

export async function getStaticProps() {
  return {
    props: {
      url: getCreds().authUrl,
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
