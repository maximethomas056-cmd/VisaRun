import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" translate="no">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <meta name="google" content="notranslate" />
        <meta property="og:title" content="VisaRun — Track Your Regional Work & Stay Longer in Australia" />
        <meta property="og:description" content="Free payslip tracker for Working Holiday backpackers. Count your regional work days, find direct employer contacts. No middleman." />
        <meta property="og:image" content="https://www.visarun.pro/og-image.png" />
        <meta property="og:url" content="https://www.visarun.pro" />
        <meta property="og:type" content="website" />
        <meta property="fb:app_id" content="966242223397198" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.visarun.pro/og-image.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN}', {
                api_host: '${process.env.NEXT_PUBLIC_POSTHOG_HOST}',
                person_profiles: 'identified_only',
              });
            `,
          }}
        />
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  )
}
