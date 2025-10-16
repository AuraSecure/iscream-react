'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [status, setStatus] = useState('Booting editor…');

  useEffect(() => {
    (async () => {
      try {
        // 1) Confirm the config is reachable
        const r = await fetch('/config.yml', { cache: 'no-store' });
        if (!r.ok) throw new Error(`config.yml HTTP ${r.status}`);
        setStatus('Config found. Loading editor…');

        // 2) Inject Decap CMS (v3). This bundle should expose window.DecapCMS (and sometimes window.CMS).
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/decap-cms@^3.0/dist/decap-cms.js';
        s.async = true;
        s.onload = () => {
          // Try both globals for maximum compatibility
          // @ts-expect-error injected by the script
          const Decap = (window as any).DecapCMS;
          // @ts-expect-error injected by the script
          const CMS = (window as any).CMS;

          const api = Decap || CMS;
          if (!api) {
            console.error('Decap CMS script loaded, but no global found (DecapCMS/CMS).');
            setStatus('Editor script loaded, but no global found. See console.');
            return;
          }

          try {
            api.init({ configPath: '/config.yml' });
            setStatus('Editor initialized ✔');
          } catch (e) {
            console.error('api.init error:', e);
            setStatus('Editor init error — see console.');
          }
        };
        s.onerror = () => {
          console.error('Failed to load Decap CMS script.');
          setStatus('Failed to load editor script — check network.');
        };
        document.body.appendChild(s);
      } catch (err) {
        console.error('Config fetch failed:', err);
        setStatus('config.yml not found or blocked — open /config.yml directly.');
      }
    })();
  }, []);

  // The editor will render itself into #nc-root
  return (
    <>
      <div id="nc-root" className="min-h-[80vh]" />
      <p className="mt-4 text-sm text-zinc-600">{status}</p>
    </>
  );
}
