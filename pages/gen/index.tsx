import { useRouter } from "next/router";
import { useEffect } from "react";

export default function GenIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push("/me");
  }, [router]);

  return null;
}
