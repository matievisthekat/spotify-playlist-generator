export function PlaylistIndex() {
  // just redirect to /me
  if (typeof window !== "undefined") window.location.href = "/me";
  return null;
}
