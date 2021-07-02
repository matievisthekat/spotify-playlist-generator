import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import Mathias from "../public/mathias.png";
import Matthew from "../public/matthew.png";
import Mateo from "../public/mateo.png";
import styles from "../styles/pages/404.module.sass";

interface DevImageProps {
  src: StaticImageData;
  alt: string;
}

function DevImage({ src, alt }: DevImageProps) {
  return <Image src={src} width={400} height={400} layout="responsive" placeholder="blur" alt={alt} />;
}

export default function NotFound() {
  const router = useRouter();

  const onClick = () => {
    router.back();
  };

  return (
    <main>
      <Head>
        <title>404 Not found</title>
        <meta name="description" content="Page not found" />
      </Head>

      <div className="container">
        <h1 className="accent">Uh Oh! You found a 404 page</h1>
        <h3>Choose a developer to take your anger out on</h3>
        <h4 className={styles.back} onClick={onClick}>
          Or just go back
        </h4>
      </div>

      <div className={styles.grid}>
        <div className={styles.developer} onClick={onClick}>
          <span className={styles.image}>
            <DevImage src={Mathias} alt="Programmer" />
          </span>
          Mathias
        </div>

        <div className={styles.developer} onClick={onClick}>
          <span className={styles.image}>
            <DevImage src={Matthew} alt="Programmer" />
          </span>
          Matthew
        </div>

        <div className={styles.developer} onClick={onClick}>
          <span className={styles.image}>
            <DevImage src={Mateo} alt="Programmer" />
          </span>
          Mateo
        </div>
      </div>
    </main>
  );
}
