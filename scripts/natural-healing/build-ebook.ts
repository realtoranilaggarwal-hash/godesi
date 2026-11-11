/**
 * Builds the member-only ebook PDF (private/ebooks/) from the seeded articles,
 * using headless Chrome to print an HTML version.
 *
 *   npx tsx scripts/natural-healing/build-ebook.ts [path-to-chrome]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ARTICLES, EBOOK } from "./articles";

const DISCLAIMER =
  "This ebook is for educational purposes only and is not medical advice. It is not intended to diagnose, treat, cure or prevent any disease. Always consult a qualified healthcare professional before starting any new health practice, remedy or supplement — especially if you are pregnant, nursing, taking medication or managing a medical condition.";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text: string) {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function blocks(body: string) {
  return body
    .split(/\n{2,}/)
    .map((raw) => {
      const lines = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.length) return "";
      let html = "";
      let rest = lines;
      const heading = lines[0].match(/^(#{2,3})\s+(.+)$/);
      if (heading) {
        html += `<h${heading[1].length + 1}>${inline(heading[2])}</h${heading[1].length + 1}>`;
        rest = lines.slice(1);
      }
      if (!rest.length) return html;
      return rest.every((l) => l.startsWith("- "))
        ? `${html}<ul>${rest.map((l) => `<li>${inline(l.slice(2))}</li>`).join("")}</ul>`
        : `${html}<p>${inline(rest.join(" "))}</p>`;
    })
    .join("\n");
}

const root = path.join(__dirname, "..", "..");
const cover = readFileSync(path.join(root, "public", "wellness", "ebook-cover.svg"), "utf8");
const chapters = ARTICLES.map(
  (article, index) => `<section class="chapter">
  <p class="num">Chapter ${index + 1}</p>
  <h1>${esc(article.title)}</h1>
  <div class="note"><b>Safety first:</b> ${esc(article.disclaimer)}</div>
  ${blocks(article.body)}
  <h3>Sources</h3>
  <ol class="src">${article.sources
    .split("\n")
    .map((line) => {
      const [title, url] = line.split("|").map((part) => part.trim());
      return `<li>${esc(title)} — <a href="${url}">${esc(url)}</a></li>`;
    })
    .join("")}</ol>
</section>`,
).join("\n");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(EBOOK.title)}</title>
<style>
@page { size: Letter; margin: 0.8in 0.8in 0.9in; }
body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; font-size: 11.5pt; line-height: 1.55; }
.cover { page-break-after: always; text-align: center; margin: -0.3in 0 0; }
.cover svg { width: 6in; height: auto; }
h1 { font-family: Helvetica, Arial, sans-serif; color: #065f46; font-size: 22pt; line-height: 1.2; margin: 0 0 10pt; }
h3 { font-family: Helvetica, Arial, sans-serif; color: #065f46; font-size: 14pt; margin: 16pt 0 6pt; }
h4 { font-family: Helvetica, Arial, sans-serif; font-size: 12pt; margin: 12pt 0 4pt; }
.chapter, .front { page-break-before: always; }
.num { font-family: Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px; color: #b45309; font-size: 9pt; margin: 0; }
.note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6pt; padding: 8pt 10pt; font-size: 10pt; margin: 8pt 0 12pt; }
.src { font-size: 9pt; } .src a { color: #4338ca; word-break: break-all; }
a { color: #4338ca; }
ol.toc li { margin: 4pt 0; }
</style></head><body>
<div class="cover">${cover}</div>
<section class="front" style="page-break-before:auto">
  <h1>Welcome</h1>
  ${blocks(EBOOK.description.replace(/## Free for GoDesi members[\s\S]*$/, ""))}
  <div class="note"><b>Health disclaimer:</b> ${esc(DISCLAIMER)}</div>
  <p>Read the articles online and find more at <a href="https://godesi.com/natural-healing">godesi.com/natural-healing</a>.</p>
  <p style="font-size:9pt;color:#64748b">© ${new Date().getFullYear()} GoDesi.com — free for personal use. Some pages on godesi.com may contain affiliate links; GoDesi may earn a commission when you purchase through certain links. This does not increase your purchase price.</p>
</section>
${chapters}
<section class="chapter"><h1>A final word</h1><p>Traditions are worth keeping — sensibly. Enjoy these habits as part of a balanced lifestyle, keep your doctor informed, and pass the wisdom (and the safety notes) on to the next generation.</p>
<div class="note"><b>Health disclaimer:</b> ${esc(DISCLAIMER)}</div></section>
</body></html>`;

const dir = mkdtempSync(path.join(tmpdir(), "ebook-"));
const file = path.join(dir, "ebook.html");
writeFileSync(file, html);
const out = path.join(root, "private", "ebooks", EBOOK.pdfUrl);
const chrome = process.argv[2] ?? process.env.CHROME_PATH ?? "google-chrome";
execFileSync(chrome, [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${out}`,
  `file://${file}`,
]);
console.log(`Wrote ${out}`);
