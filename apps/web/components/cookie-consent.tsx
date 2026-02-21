'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function handleAcceptAll() {
    localStorage.setItem('cookie_consent', JSON.stringify({ analytics: true, advertising: true }));
    setVisible(false);
  }

  function handleRejectAll() {
    localStorage.setItem('cookie_consent', JSON.stringify({ analytics: false, advertising: false }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          We use cookies to improve your experience. You can customize your preferences.
        </p>
        <div className="flex gap-2">
          <button onClick={handleRejectAll} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
            Reject all
          </button>
          <button onClick={handleAcceptAll} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
