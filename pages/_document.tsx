import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <Script
          id="google-adsense"
          data-ad-client="ca-pub-4374857081025109"
          async={true}
          strategy="beforeInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374857081025109"
          onError={(e) => console.error('AdSense script failed to load: ', e)}
        ></Script>
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-7DMRTCSBEV"
        ></Script>
        <Script id="google-analytics" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7DMRTCSBEV');`}
        </Script>
      </body>
    </Html>
  );
}