import { useEffect } from "react";

export default function PlaylistIndex() {
  useEffect(() => {
    window.location.href = "/me";
  }, []);
  
  return null;
}
