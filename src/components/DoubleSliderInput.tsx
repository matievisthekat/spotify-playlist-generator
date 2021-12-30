import { useState } from "react";
import Slider from "@material-ui/core/Slider";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";

interface Props {
  min: number;
  max: number;
  step?: number;
  name?: string;

  onChangeCommitted(v: number[]): void;
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

export default function DoubleSliderInput({ min, max, onChangeCommitted, name }: Props) {
  const [value, setValue] = useState([min, max]);

  return (
    <ThemeProvider theme={theme}>
      <Slider
        min={min}
        max={max}
        value={value}
        name={name}
        onChange={(_, v) => setValue(v as number[])}
        onChangeCommitted={(_, v) => onChangeCommitted(v as number[])}
        orientation="vertical"
        getAriaLabel={() => `${name} filter slider`}
        getAriaValueText={() => `${value[0]} - ${value[1]}`}
        style={{ height: "200px" }}
        color="primary"
        valueLabelDisplay="auto"
      />
    </ThemeProvider>
  );
}
