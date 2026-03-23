import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta property="og:title" content="VisaRun — Track Your Regional Work & Stay Longer in Australia" />
        <meta property="og:description" content="Free payslip tracker for Working Holiday backpackers. Count your regional work days, find direct employer contacts. No middleman." />
        <meta property="og:image" content="https://www.visarun.pro/og-image.png" />
        <meta property="og:url" content="https://www.visarun.pro" />
        <meta property="og:type" content="website" />
        <meta property="fb:app_id" content="966242223397198" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.visarun.pro/og-image.png" />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
