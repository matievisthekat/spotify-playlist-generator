import Updater from "spotify-oauth-refresher";

export const updater = new Updater({ clientId: "76d4b7cc92a94b3197de9a8036bd64e1" });

export const scope = ["playlist-modify-public", "playlist-modify-private"];

export const categories = [
  { name: "Dance", desc: "Songs that are suitable to dance to" },
  { name: "Energetic", desc: "Songs that are high in energy" },
  { name: "Acoustic", desc: "Songs that are majorly acoustic" },
  { name: "Instrumental", desc: "Songs that are mostly instrumental" },
  { name: "Live", desc: "Songs that are recordings of live shows" },
  { name: "Happy", desc: "Songs that are positive in nature" },
];
