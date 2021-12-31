import { useEffect } from "react";

export const PlaylistIndex = () => {
  useEffect(() => {
    window.location.href = "/me";
  }, []);
  
  return <h1>Redirecting</h1>;
}
