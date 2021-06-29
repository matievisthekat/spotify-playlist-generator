export const getCreds = () => ({
  id: process.env.ID as string,
  secret: process.env.SECRET as string,
  uri: process.env.REDIRECT_URI,
});

export const scope = ["playlist-modify-public", "playlist-modify-private"];

export const categories = [
  { name: "Dance", desc: "Songs that are suitable to dance to" },
  { name: "Energetic", desc: "Songs that are high in energy" },
  { name: "Acoustic", desc: "Songs that are majorly acoustic" },
  { name: "Instrumental", desc: "Songs that are mostly instrumental" },
  { name: "Live", desc: "Songs that are recordings of live shows" },
  { name: "Happy", desc: "Songs that are positive in nature" },
];
