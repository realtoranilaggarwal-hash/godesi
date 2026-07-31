/**
 * IndexNow tells Bing, Yandex, Seznam, Naver and Yep about new or changed pages
 * the moment they appear, instead of waiting for a crawl. The key is public by
 * design: it is served from /<key>.txt so the engines can verify we own the
 * domain. Google does not take IndexNow — it reads the sitemap in robots.txt.
 */
export const INDEXNOW_KEY = "d1c3c0ca36429eaba3ccfe190f8eea6d";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = "godesi.com";

/** Pushes every url in the public sitemap so fresh listings, events and news are picked up. */
export async function submitSitemapToIndexNow() {
  try {
    const response = await fetch(`https://${HOST}/sitemap.xml`, { cache: "no-store" });
    if (!response.ok) return { submitted: 0, status: response.status };
    const xml = await response.text();
    const urls = (xml.match(/<loc>[^<]+<\/loc>/g) ?? []).map((tag) =>
      tag.replace(/<\/?loc>/g, "").trim(),
    );
    return submitToIndexNow(urls);
  } catch {
    return { submitted: 0, status: 0 };
  }
}

export async function submitToIndexNow(urls: string[]) {
  const urlList = urls.filter((url) => url.startsWith(`https://${HOST}`)).slice(0, 10_000);
  if (!urlList.length) return { submitted: 0, status: 0 };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    return { submitted: urlList.length, status: response.status };
  } catch {
    return { submitted: 0, status: 0 };
  }
}
