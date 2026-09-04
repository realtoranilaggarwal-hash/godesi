import type { WebsiteProject } from "@prisma/client";
import { designFor, type Design, type SiteContent, websitePath } from "@/lib/websiteBuilder";
import { siteUrl } from "@/lib/format";
import {
  projectContent,
  projectFound,
  projectPhotos,
} from "@/lib/websiteProjects";

/**
 * Renders a project as a complete standalone web page — the thing the owner
 * previews in an iframe and, once paid, the thing we host. Plain HTML and CSS
 * with no scripts, so it is safe to serve from a route handler and fast on a
 * phone. Every value is escaped; the AI and the public pages are untrusted.
 */

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const digits = (value: string) => value.replace(/[^\d+]/g, "");

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${esc(part)}</p>`)
    .join("");

function css(design: Design) {
  const { palette, font, rounded } = design;
  const radius = rounded ? "18px" : "4px";
  return `
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:${font.body};color:#1f2937;background:#fff;line-height:1.6}
h1,h2,h3{font-family:${font.heading};color:${palette.dark};line-height:1.15}
a{color:${palette.primary}}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
nav{position:sticky;top:0;background:#fff;border-bottom:1px solid #eee;z-index:5}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:12px}
nav .brand{font-family:${font.heading};font-weight:800;font-size:20px;color:${palette.dark};text-decoration:none;display:flex;align-items:center;gap:10px}
nav .brand img{height:40px;width:auto;border-radius:8px}
nav .links{display:flex;gap:18px;font-size:14px;font-weight:600}
nav .links a{color:#374151;text-decoration:none}
.btn{display:inline-block;background:${palette.primary};color:#fff;font-weight:700;padding:12px 22px;border-radius:${rounded ? "999px" : radius};text-decoration:none;font-size:15px}
.btn.alt{background:${palette.accent};color:${palette.dark}}
.btn.ghost{background:transparent;color:${palette.primary};border:2px solid ${palette.primary}}
.hero{position:relative;color:#fff;overflow:hidden}
.hero.photo{min-height:520px;display:flex;align-items:center;background:${palette.dark}}
.hero.photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}
.hero.photo .wrap{position:relative;padding:80px 20px}
.hero.solid{background:linear-gradient(135deg,${palette.primary},${palette.dark});padding:90px 0}
.hero.split{background:${palette.light};color:${palette.dark}}
.hero.split .wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;padding:60px 20px}
.hero.split img{width:100%;height:380px;object-fit:cover;border-radius:${radius}}
.hero.split h1{color:${palette.dark}}
.hero.split p{color:#374151}
.hero h1{font-size:clamp(34px,5vw,58px);color:inherit;max-width:720px}
.hero p{font-size:19px;margin:18px 0 28px;max-width:600px;opacity:.95}
.hero .actions{display:flex;gap:12px;flex-wrap:wrap}
.hero .rating{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.15);padding:6px 12px;border-radius:999px;font-size:14px;margin-bottom:16px}
.hero.split .rating{background:#fff;color:${palette.dark}}
section{padding:70px 0}
section:nth-of-type(even){background:${palette.light}}
.eyebrow{color:${palette.primary};font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
h2{font-size:clamp(26px,3.5vw,38px);margin:6px 0 28px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.card{background:#fff;border:1px solid #eceff3;border-radius:${radius};padding:24px}
.card h3{font-size:19px;margin-bottom:8px}
.card p{color:#4b5563;font-size:15px}
.about{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center}
.about p{margin-bottom:14px;font-size:17px;color:#374151}
.about img{width:100%;height:340px;object-fit:cover;border-radius:${radius}}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.gallery img{width:100%;height:200px;object-fit:cover;border-radius:${radius}}
.why{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.why div{display:flex;gap:12px;align-items:flex-start;font-weight:600;font-size:16px}
.why span{color:${palette.accent};font-size:22px;line-height:1}
.reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.review{background:#fff;border-radius:${radius};padding:22px;border:1px solid #eceff3}
.review .stars{color:${palette.accent};letter-spacing:2px}
.review p{margin:10px 0;color:#374151;font-size:15px}
.review small{color:#6b7280;font-weight:600}
.faq details{background:#fff;border:1px solid #eceff3;border-radius:${radius};padding:16px 20px;margin-bottom:10px}
.faq summary{font-weight:700;cursor:pointer;font-size:16px}
.faq p{margin-top:10px;color:#4b5563}
.contact{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.contact ul{list-style:none;font-size:16px}
.contact li{margin-bottom:12px;display:flex;gap:10px}
.contact form{display:grid;gap:12px}
.contact input,.contact textarea{width:100%;padding:12px 14px;border:1px solid #d1d5db;border-radius:${rounded ? "12px" : radius};font:inherit;font-size:15px}
.hours{font-size:14px;color:#4b5563;margin-top:14px}
footer{background:${palette.dark};color:#cbd5e1;padding:36px 0;font-size:14px}
footer .wrap{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
footer a{color:#e2e8f0}
.sticky-call{position:fixed;bottom:16px;left:16px;right:16px;display:none;gap:10px;z-index:9}
.sticky-call .btn{flex:1;text-align:center}
@media(max-width:760px){
  nav .links{display:none}
  .hero.split .wrap{grid-template-columns:1fr}
  .hero.split img{height:240px}
  .about,.contact{grid-template-columns:1fr}
  section{padding:50px 0}
  .sticky-call{display:flex}
  body{padding-bottom:70px}
}`;
}

const stars = (n?: number) =>
  n ? "★".repeat(Math.round(Math.min(5, Math.max(1, n)))) : "★★★★★";

type Sections = Record<Design["order"][number], string>;

/** The whole site as an HTML document string. */
export function renderSite(project: WebsiteProject): string {
  const design = designFor(project.designSeed);
  const content: SiteContent =
    projectContent(project) ?? {
      headline: project.businessName,
      tagline: `${project.category} in ${project.city}`,
      about: "",
      services: [],
      whyUs: [],
      cta: "Get in touch",
      seoTitle: project.businessName,
      seoDescription: "",
      faq: [],
    };
  const found = projectFound(project);
  const photos = projectPhotos(project);
  const logo = project.uploads[0];
  const hero = photos[0];
  const name = esc(project.businessName);
  const phone = project.phone ?? found?.phone;
  const whatsapp = project.whatsapp ?? project.phone;
  const address = project.address ?? found?.address;
  const email = project.email ?? found?.email;
  const mapsHref = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
  const reviews = (found?.reviews ?? []).slice(0, 3);
  const leadUrl = `${siteUrl()}${websitePath(project.id, "/site/lead")}`;

  const actions = [
    phone ? `<a class="btn" href="tel:${esc(digits(phone))}">📞 Call ${esc(phone)}</a>` : "",
    whatsapp
      ? `<a class="btn alt" href="https://wa.me/${esc(digits(whatsapp).replace(/^\+/, ""))}">💬 WhatsApp</a>`
      : "",
    `<a class="btn ghost" href="#contact">${esc(content.cta)}</a>`,
  ]
    .filter(Boolean)
    .join("");

  const rating =
    found?.rating && found.reviewCount
      ? `<div class="rating">⭐ ${found.rating.toFixed(1)} · ${found.reviewCount} Google reviews</div>`
      : "";

  const heroHtml =
    design.hero === "photo" && hero
      ? `<header class="hero photo"><img src="${esc(hero)}" alt=""><div class="wrap">${rating}<h1>${esc(content.headline)}</h1><p>${esc(content.tagline)}</p><div class="actions">${actions}</div></div></header>`
      : design.hero === "split" && hero
        ? `<header class="hero split"><div class="wrap"><div>${rating}<h1>${esc(content.headline)}</h1><p>${esc(content.tagline)}</p><div class="actions">${actions}</div></div><img src="${esc(hero)}" alt=""></div></header>`
        : `<header class="hero solid"><div class="wrap">${rating}<h1>${esc(content.headline)}</h1><p>${esc(content.tagline)}</p><div class="actions">${actions}</div></div></header>`;

  const sections: Sections = {
    services: content.services.length
      ? `<section id="services"><div class="wrap"><p class="eyebrow">What we do</p><h2>Our services</h2><div class="grid">${content.services
          .map((item) => `<div class="card"><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p></div>`)
          .join("")}</div></div></section>`
      : "",
    about: content.about
      ? `<section id="about"><div class="wrap"><div class="about"><div><p class="eyebrow">About us</p><h2>${name}</h2>${paragraphs(content.about)}</div>${
          photos[1] ? `<img src="${esc(photos[1])}" alt="">` : ""
        }</div></div></section>`
      : "",
    gallery:
      photos.length > 2
        ? `<section id="gallery"><div class="wrap"><p class="eyebrow">Gallery</p><h2>A look inside</h2><div class="gallery">${photos
            .slice(1, 9)
            .map((src) => `<img src="${esc(src)}" alt="" loading="lazy">`)
            .join("")}</div></div></section>`
        : "",
    why: content.whyUs.length
      ? `<section id="why"><div class="wrap"><p class="eyebrow">Why us</p><h2>Why people choose ${name}</h2><div class="why">${content.whyUs
          .map((item) => `<div><span>✔</span>${esc(item)}</div>`)
          .join("")}</div></div></section>`
      : "",
    reviews: reviews.length
      ? `<section id="reviews"><div class="wrap"><p class="eyebrow">Reviews</p><h2>What customers say</h2><div class="reviews">${reviews
          .map(
            (review) =>
              `<div class="review"><div class="stars">${stars(review.rating)}</div><p>“${esc(review.text.slice(0, 280))}”</p><small>${esc(review.author ?? "Google review")}</small></div>`,
          )
          .join("")}</div></div></section>`
      : "",
    faq: content.faq.length
      ? `<section id="faq"><div class="wrap"><p class="eyebrow">FAQ</p><h2>Questions we get asked</h2><div class="faq">${content.faq
          .map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`)
          .join("")}</div></div></section>`
      : "",
    contact: `<section id="contact"><div class="wrap"><p class="eyebrow">Contact</p><h2>${esc(content.cta)}</h2><div class="contact"><div><ul>${
      phone ? `<li>📞 <a href="tel:${esc(digits(phone))}">${esc(phone)}</a></li>` : ""
    }${whatsapp ? `<li>💬 <a href="https://wa.me/${esc(digits(whatsapp).replace(/^\+/, ""))}">WhatsApp us</a></li>` : ""}${
      email ? `<li>✉️ <a href="mailto:${esc(email)}">${esc(email)}</a></li>` : ""
    }${address ? `<li>📍 <span>${esc(address)}${mapsHref ? ` · <a href="${esc(mapsHref)}">Directions</a>` : ""}</span></li>` : ""}</ul>${
      found?.hours?.length
        ? `<div class="hours"><strong>Hours</strong><br>${found.hours.map(esc).join("<br>")}</div>`
        : ""
    }</div><form method="post" action="${esc(leadUrl)}"><input name="name" placeholder="Your name" required maxlength="120"><input name="contact" placeholder="Phone or email" required maxlength="160"><textarea name="message" rows="4" placeholder="How can we help?" required maxlength="2000"></textarea><input type="text" name="company" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px"><button class="btn" type="submit">Send message</button></form></div></div></section>`,
  };

  const body = design.order.map((key) => sections[key]).join("");

  const navLinks = design.order
    .filter((key) => sections[key])
    .map((key) => `<a href="#${key}">${key === "why" ? "Why us" : key[0].toUpperCase() + key.slice(1)}</a>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(content.seoTitle || project.businessName)}</title>
<meta name="description" content="${esc(content.seoDescription)}">
<style>${css(design)}</style>
</head>
<body>
<nav><div class="wrap"><a class="brand" href="#">${logo ? `<img src="${esc(logo)}" alt="">` : ""}${name}</a><div class="links">${navLinks}</div>${
    phone ? `<a class="btn" href="tel:${esc(digits(phone))}">Call</a>` : `<a class="btn" href="#contact">${esc(content.cta)}</a>`
  }</div></nav>
${heroHtml}
${body}
<footer><div class="wrap"><div>© ${new Date().getFullYear()} ${name}${address ? ` · ${esc(address)}` : ""}</div><div>Website by <a href="https://godesi.com/website">GoDesi</a></div></div></footer>
<div class="sticky-call">${phone ? `<a class="btn" href="tel:${esc(digits(phone))}">📞 Call</a>` : ""}${
    whatsapp ? `<a class="btn alt" href="https://wa.me/${esc(digits(whatsapp).replace(/^\+/, ""))}">💬 WhatsApp</a>` : ""
  }</div>
</body>
</html>`;
}
