// Curated fallback photos from Unsplash (used when API is unavailable)
// Format: destination keyword → Unsplash photo ID

const FALLBACK_PHOTOS: Record<string, string> = {
  // Asia
  'tokyo':        'photo-1540959733332-eab4deabeeaf',
  'japan':        'photo-1493976040374-85c8e12f0c0e',
  'kyoto':        'photo-1545569341-9eb8b30979d9',
  'osaka':        'photo-1590559899731-a382839e5549',
  'bangkok':      'photo-1508009603885-50cf7c579365',
  'thailand':     'photo-1528181304800-259b08848526',
  'bali':         'photo-1537996194471-e657df975ab4',
  'singapore':    'photo-1525625293386-3f8f99389edd',
  'seoul':        'photo-1534274867514-d5b47ef89ed7',
  'mumbai':       'photo-1529253355930-ddbe423a2ac7',
  'delhi':        'photo-1587474260584-136574528ed5',
  'new delhi':    'photo-1587474260584-136574528ed5',
  'goa':          'photo-1512343879784-a960bf40e7f2',
  'jaipur':       'photo-1477587458883-47145ed94245',
  'agra':         'photo-1564507592333-c60657eea523',
  'kerala':       'photo-1602216056096-3b40cc0c9944',
  'dubai':        'photo-1512453979798-5ea266f8880c',

  // Europe
  'paris':        'photo-1502602898657-3e91760cbb34',
  'london':       'photo-1513635269975-59663e0ac1ad',
  'rome':         'photo-1552832230-c0197dd311b5',
  'barcelona':    'photo-1583422409516-2895a77efded',
  'amsterdam':    'photo-1534351590666-13e3e96b5017',
  'prague':       'photo-1541849546-216549ae216d',
  'santorini':    'photo-1570077188670-e3a8d69ac5ff',
  'istanbul':     'photo-1527838832700-5059252407fa',

  // Americas
  'new york':     'photo-1496442226666-8d4d0e62e6e9',
  'los angeles':  'photo-1534190760961-74e8c1c5c3da',
  'san francisco':'photo-1501594907352-04cda38ebc29',
  'rio de janeiro':'photo-1483729558449-99ef09a8c325',
  'mexico city':  'photo-1518638150340-f706e86654de',

  // Oceania
  'sydney':       'photo-1506973035872-a4ec16b8e8d9',
  'new zealand':  'photo-1469521669194-babb45599def',
};

const DEFAULT_FALLBACK = 'photo-1488646953014-85cb44e25828';

// ── Client-side in-memory cache for API results ──
const photoCache = new Map<string, string>();

/**
 * Synchronous fallback: returns a static Unsplash CDN URL from the curated map.
 * Used as an immediate placeholder while the API result loads.
 */
export function getDestinationPhoto(destination: string, width = 800): string {
  const dest = destination.toLowerCase().trim();
  const url = (id: string) =>
    `https://images.unsplash.com/${id}?w=${width}&q=80&fit=crop&auto=format`;

  // Check runtime cache first (filled by API calls)
  const cached = photoCache.get(dest);
  if (cached) return cached;

  // Exact match in static fallback
  if (FALLBACK_PHOTOS[dest]) return url(FALLBACK_PHOTOS[dest]);

  // Split "City, Country" and try each part
  const parts = dest.split(',').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (FALLBACK_PHOTOS[part]) return url(FALLBACK_PHOTOS[part]);
  }

  // Partial match — longest key wins
  let bestKey = '';
  let bestId = '';
  for (const [key, photoId] of Object.entries(FALLBACK_PHOTOS)) {
    if ((dest.includes(key) || key.includes(dest)) && key.length > bestKey.length) {
      bestKey = key;
      bestId = photoId;
    }
  }
  if (bestId) return url(bestId);

  return url(DEFAULT_FALLBACK);
}

/**
 * Async: fetch a destination photo from the Unsplash API via our proxy route.
 * Returns the photo URL (or the static fallback on error).
 * Caches results client-side to avoid repeated requests.
 */
export async function fetchDestinationPhoto(
  destination: string,
  width = 800,
): Promise<string> {
  const dest = destination.toLowerCase().trim();

  // Return from cache instantly
  const cached = photoCache.get(`${dest}:${width}`);
  if (cached) return cached;

  try {
    const res = await fetch(
      `/api/photos?query=${encodeURIComponent(destination)}&w=${width}`,
    );
    if (!res.ok) throw new Error('API error');

    const data = await res.json();
    if (data.url) {
      photoCache.set(`${dest}:${width}`, data.url);
      photoCache.set(dest, data.url); // also cache without width for sync getter
      return data.url;
    }
  } catch {
    // Silently fall back to static map
  }

  return getDestinationPhoto(destination, width);
}
