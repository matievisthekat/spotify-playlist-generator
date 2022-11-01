import Script from "next/script";

export default function DefaultAd() {
  return (
    <>
      <Script
        async={true}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4374857081025109"
        onError={(e) => console.error("AdSense script failed to load: ", e)}
      ></Script>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4374857081025109"
        data-ad-slot="3540354481"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    </>
  );
}