/**
 * Routes a third-party image through our own proxy, so publishers that refuse
 * hot-linking still render. Our own uploads are served directly.
 */
export function proxyImage(url: string) {
  if (!/^https?:\/\//i.test(url)) return url;
  if (url.includes(".public.blob.vercel-storage.com")) return url;
  return `/api/img?u=${encodeURIComponent(url)}`;
}
