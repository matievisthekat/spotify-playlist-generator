import { useRouter } from "next/router";
import styles from "../../styles/components/GenerateButton.module.sass";

interface Props {
  href: string;
}

export default function GenerateButton({ href }: Props) {
  const router = useRouter();

  return (
    <span className={styles.container} onClick={() => router.push(href)}>
      &rarr;
    </span>
  );
}
