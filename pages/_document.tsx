import { Head, Html, Main, NextScript } from 'next/document';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

export default function Document() {
    return (
        <Html lang="en" {...mantineHtmlProps}>
            <Head>
                <ColorSchemeScript />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#9CCBCE" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
