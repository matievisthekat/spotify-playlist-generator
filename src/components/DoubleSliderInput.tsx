import Slider from "@material-ui/core/Slider";

interface Props {
  min: number;
  max: number;
  step?: number;
  name?: string;

  value?: number[];
  onChange(v: number[]): void;
}

export default function DoubleSliderInput({ value, min, max, onChange, name }: Props) {
  return (
    <>
      <Slider
        min={min}
        max={max}
        value={value}
        defaultValue={[min, max]}
        name={name}
        onChange={(_, v) => onChange(v as number[])}
        orientation="horizontal"
        valueLabelDisplay="auto"
      />
    </>
  );
}
