'use client';

import { useState, useEffect } from 'react';
import { getDestinationPhoto, fetchDestinationPhoto } from '@/lib/photos';

/**
 * React hook that returns a destination photo URL.
 * Immediately returns the static fallback, then upgrades
 * to a live Unsplash result once the API responds.
 */
export function useDestinationPhoto(destination: string, width = 800): string {
  const fallback = getDestinationPhoto(destination, width);
  const [url, setUrl] = useState(fallback);

  useEffect(() => {
    if (!destination) return;

    let cancelled = false;
    fetchDestinationPhoto(destination, width).then((photo) => {
      if (!cancelled) setUrl(photo);
    });

    return () => { cancelled = true; };
  }, [destination, width]);

  return url;
}
