import { useRouter } from "next/router";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import styles from "../../styles/components/GenerateButton.module.sass";

interface Props {
  href: string;
}

export default function GenerateButton({ href }: Props) {
  const router = useRouter();

  return (
    <span className={styles.container} onClick={() => router.push(href)}>
      <ArrowForwardIcon />
    </span>
  );
}
