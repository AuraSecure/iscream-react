'use client';

import { useEffect } from 'react';

export default function AdminPage() {
  useEffect(() => {
    // Inject the Decap (Netlify CMS) script from CDN
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/netlify-cms-app@^2.0/dist/netlify-cms.js';
    s.async = true;
    s.onload = () => {
      // @ts-expect-error - CMS is provided by the script
      const CMS = (window as any).CMS;
      if (CMS) {
        CMS.init({ configPath: '/admin/config.yml' });
      }
    };
    document.body.appendChild(s);
    return () => {
      document.body.removeChild(s);
    };
  }, []);

  // Decap renders the UI into #nc-root
  return <div id="nc-root" className="min-h-[80vh]" />;
}
