import Updater from "spotify-oauth-refresher";

export const removeEl = (arr: string[], item: string) => {
  const newArr = new Array(...arr);
  const index = newArr.indexOf(item);
  if (index !== -1) newArr.splice(index, 1);
  return newArr;
};

export const getCreds = () => ({
  clientId: process.env.ID as string,
  clientSecret: process.env.SECRET as string,
  uri: process.env.REDIRECT_URI as string,
  authUrl: `https://accounts.spotify.com/authorize?response_type=code&client_id=${
    process.env.ID
  }&scope=${encodeURIComponent(scope.join(" "))}&redirect_uri=${process.env.REDIRECT_URI}&show_dialog=true`,
});

export const toProperCase = (s: string) => {
  return s
    .split(/ +/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1, w.length))
    .join(" ");
};

export const requireLogin = (updater: Updater, authUrl: string) => {
  if (!updater.accessToken || !updater.refreshToken) window.location.href = authUrl;
};

export const scope = ["playlist-modify-public", "playlist-modify-private", "user-library-read"];

export interface CredProps {
  clientId: string;
  clientSecret: string;
  uri: string;
  authUrl: string;
}

export type CategoryName =
  | "danceability"
  | "acousticness"
  | "energy"
  | "instrumentalness"
  | "liveness"
  | "speechiness"
  | "valence"
  | "tempo";

export const categories: Record<CategoryName, string> = {
  danceability:
    "Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity",
  acousticness: "A confidence measure of whether the track is acoustic",
  energy:
    "Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale",
  instrumentalness:
    "Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. The the higher the rating, the greater likelihood the track contains no vocal content",
  liveness:
    "Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live",
  speechiness:
    "Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the higher the rating",
  valence:
    "The musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).",
  tempo: "The overall estimated tempo of a track in beats per minute (BPM)",
};
