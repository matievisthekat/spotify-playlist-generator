import { useEffect } from "react";

export function PlaylistIndex() {
  useEffect(() => {
    window.location.href = "/me";
  }, []);
  
  return null;
}
