import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PlaylistIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push("/me");
  }, []);
  
  return null;
}
