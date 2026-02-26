import { Html, Head, Main, NextScript } from "next/document";
import type { DocumentProps } from "next/document";

const rtlLocales = ["ar"];

export default function Document(props: DocumentProps) {
  const locale = props.__NEXT_DATA__?.locale || "en";
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ffa500" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
