import Slider from "@material-ui/core/Slider";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";

interface Props {
  min: number;
  max: number;
  step?: number;
  name?: string;

  value?: number[];
  onChange(v: number[]): void;
}

const theme = createTheme({
  overrides: {
    MuiSlider: {
      root: {
        color: "black",
      },
      thumb: {
        color: "#1DB954",
      },
      track: {
        backgroundColor: "#1DB954",
      },
    },
  },
});

export default function DoubleSliderInput({ value, min, max, onChange, name }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <Slider
        min={min}
        max={max}
        value={value}
        name={name}
        onChange={(_, v) => onChange(v as number[])}
        orientation="vertical"
        valueLabelDisplay="auto"
        aria-label="vertical slider"
        aria-valuetext={`${value?.at(0)} - ${value?.at(1)}`}
        style={{ height: "200px" }}
        color="primary"
      />
    </ThemeProvider>
  );
}
