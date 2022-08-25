import { useEffect } from "react";
import { useRouter } from "next/router";
import { TokenCookies } from "../src/util";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    TokenCookies.setAccessToken("").setRefreshToken("");
    router.push("/");
  }, []);

  return (
    <div className="container">
      <main>
        <h1>Redirecting...</h1>
      </main>
    </div>
  );
}
