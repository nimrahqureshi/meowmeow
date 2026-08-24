"use client";

import Script from "next/script";
import { useStorageValue } from "@/lib/client-store";

/**
 * Analytics loader.
 *
 * IDs come from the environment rather than being hardcoded, so a fork or a
 * preview deployment does not report into the production property, and the
 * scripts simply do not render when nothing is configured.
 *
 * Both tags are gated on the cookie banner: the site asks for consent, so it
 * must honour the answer. "Essentials only" means no analytics loads at all,
 * which is what GDPR/ePrivacy require and what the banner promises.
 */
export default function Analytics() {
  const consent = useStorageValue("mm-cookies", "pending");

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  // "pending" is the server/hydration snapshot — render nothing until the real
  // stored answer is known, and never load on an essentials-only choice.
  if (consent !== "all") return null;

  return (
    <>
      {gaId && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      )}

      {clarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      )}
    </>
  );
}
