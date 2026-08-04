/**
 * Routes a third-party image through our own proxy, so publishers that refuse
 * hot-linking still render. Our own uploads are served directly.
 */
export function proxyImage(url: string) {
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.includes(".public.blob.vercel-storage.com")) return url;
  return `/api/img?u=${encodeURIComponent(url)}`;
}

/**
 * Card thumbnails asked for the original upload — a phone was downloading half a
 * megabyte for a 320px-wide photo. Resizing through the image optimizer keeps
 * the same picture at a fraction of the bytes, and the result is cached at the
 * edge. Widths must be one of next.config's device/image sizes.
 */
export function thumbImage(url: string, width: 384 | 640 | 750 | 1080 = 640) {
  const source = proxyImage(url);
  if (source.startsWith("/_next/image")) return source;
  return `/_next/image?url=${encodeURIComponent(source)}&w=${width}&q=70`;
}
