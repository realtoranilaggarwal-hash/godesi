/** Curated free/freemium tools directory — /tools. Affiliate URLs where we hold one. */
export type Tool = {
  name: string;
  url: string;
  blurb: string;
  pricing: "Free" | "Freemium";
  /** true when the link earns GoDesi a commission — disclosed + marked sponsored. */
  partner?: boolean;
};

export type ToolCategory = { name: string; icon: string; tools: Tool[] };

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    name: "SEO & traffic research",
    icon: "🔍",
    tools: [
      { name: "Google Search Console", url: "https://search.google.com/search-console", blurb: "See which searches bring visitors, fix indexing, submit sitemaps — the one every site owner needs first.", pricing: "Free" },
      { name: "Google Trends", url: "https://trends.google.com", blurb: "Compare what people search for over time and by region — spot topics before they peak.", pricing: "Free" },
      { name: "AnswerThePublic", url: "https://answerthepublic.com", blurb: "The real questions people type about any topic, grouped for instant article ideas.", pricing: "Freemium" },
      { name: "AlsoAsked", url: "https://alsoasked.com", blurb: "Maps Google's 'People Also Ask' questions into a visual tree for content planning.", pricing: "Freemium" },
      { name: "PageSpeed Insights", url: "https://pagespeed.web.dev", blurb: "Google's speed test — measure Core Web Vitals and get fixes that help rankings.", pricing: "Free" },
      { name: "Ubersuggest", url: "https://neilpatel.com/ubersuggest/", blurb: "Keyword ideas, search volume and backlink data; free tier gives a few searches a day.", pricing: "Freemium" },
    ],
  },
  {
    name: "Writing & content",
    icon: "✍️",
    tools: [
      { name: "ChatGPT", url: "https://chatgpt.com", blurb: "AI drafts for posts, emails, captions and scripts — the free tier covers most needs.", pricing: "Freemium" },
      { name: "Google Docs", url: "https://docs.google.com", blurb: "Collaborative writing and editing in the browser — share, comment, version for free.", pricing: "Free" },
      { name: "Hemingway Editor", url: "https://hemingwayapp.com", blurb: "Highlights long, complex sentences so your writing reads bold and clear.", pricing: "Free" },
      { name: "Notion", url: "https://notion.so", blurb: "Notes, docs and planning boards in one workspace — great as an editorial calendar.", pricing: "Freemium" },
      { name: "Grammarly", url: "https://grammarly.com", blurb: "Grammar, spelling and tone checks across your browser and apps.", pricing: "Freemium" },
      { name: "Perplexity AI", url: "https://perplexity.ai", blurb: "AI research with cited, live web sources — fast fact-checking and topic exploration.", pricing: "Freemium" },
    ],
  },
  {
    name: "Design & graphics",
    icon: "🎨",
    tools: [
      { name: "Canva", url: "https://canva.com", blurb: "Drag-and-drop graphics, thumbnails, flyers and presentations — the default for non-designers.", pricing: "Freemium" },
      { name: "Unsplash", url: "https://unsplash.com", blurb: "Free high-resolution photos you can use anywhere, no attribution required.", pricing: "Free" },
      { name: "Pexels", url: "https://pexels.com", blurb: "Free stock photos and videos with a huge library and simple license.", pricing: "Free" },
      { name: "Remove.bg", url: "https://remove.bg", blurb: "One-click AI background removal — product shots and thumbnails in seconds.", pricing: "Freemium" },
      { name: "Figma", url: "https://figma.com", blurb: "Collaborative design in the browser — mockups, graphics and prototypes, free for small projects.", pricing: "Freemium" },
      { name: "Photopea", url: "https://photopea.com", blurb: "Free Photoshop alternative that opens PSD files right in the browser.", pricing: "Free" },
      { name: "Coolors", url: "https://coolors.co", blurb: "Instant color palettes — generate, lock, export brand colors for your content.", pricing: "Freemium" },
      { name: "Adobe Express", url: "https://www.adobe.com/express/", blurb: "Adobe's free template editor for social graphics, reels and flyers.", pricing: "Freemium" },
    ],
  },
  {
    name: "Video & audio",
    icon: "🎬",
    tools: [
      { name: "CapCut", url: "https://capcut.com", blurb: "Free editor built for short-form — captions, effects and templates for Reels/TikTok.", pricing: "Free" },
      { name: "YouTube Studio", url: "https://studio.youtube.com", blurb: "Manage videos, analytics and search optimization for your channel — free.", pricing: "Free" },
      { name: "Audacity", url: "https://audacityteam.org", blurb: "Open-source audio recorder/editor — podcasts, voiceovers, cleanup.", pricing: "Free" },
      { name: "DaVinci Resolve", url: "https://blackmagicdesign.com/products/davinciresolve", blurb: "Pro-grade editor with color correction and effects — the free version is genuinely powerful.", pricing: "Free" },
      { name: "OBS Studio", url: "https://obsproject.com", blurb: "Free streaming and screen recording — go live on YouTube/Twitch or record tutorials.", pricing: "Free" },
      { name: "Descript", url: "https://descript.com", blurb: "Edit video by editing the transcript — AI transcription, screen recording, podcast tools.", pricing: "Freemium" },
      { name: "Clipchamp", url: "https://clipchamp.com", blurb: "Microsoft's free browser video editor — AI voiceover, stock footage, captions.", pricing: "Free" },
    ],
  },
  {
    name: "Social scheduling",
    icon: "📅",
    tools: [
      { name: "Meta Business Suite", url: "https://business.facebook.com", blurb: "Schedule and manage Facebook + Instagram posts from one dashboard, with insights.", pricing: "Free" },
      { name: "Buffer", url: "https://buffer.com", blurb: "Schedule posts across platforms; free plan covers 3 channels.", pricing: "Freemium" },
      { name: "Later", url: "https://later.com", blurb: "Visual drag-and-drop calendar for Instagram, TikTok, Pinterest and LinkedIn.", pricing: "Freemium" },
      { name: "TweetHunter", url: "https://tweethunter.io", blurb: "Viral tweet inspiration, thread scheduling and AI growth tools for X/Twitter.", pricing: "Freemium" },
    ],
  },
  {
    name: "Analytics & insights",
    icon: "📊",
    tools: [
      { name: "Google Analytics (GA4)", url: "https://analytics.google.com", blurb: "Full traffic, behavior and conversion tracking — the industry standard, free.", pricing: "Free" },
      { name: "Microsoft Clarity", url: "https://clarity.microsoft.com", blurb: "Free heatmaps and session recordings — watch how visitors actually use your site.", pricing: "Free" },
      { name: "Hotjar", url: "https://hotjar.com", blurb: "Heatmaps, recordings and feedback widgets; free for a small daily session cap.", pricing: "Freemium" },
      { name: "Plausible", url: "https://plausible.io", blurb: "Lightweight, privacy-friendly analytics — no cookies, GDPR-friendly, self-hostable.", pricing: "Freemium" },
      { name: "Google Tag Manager", url: "https://tagmanager.google.com", blurb: "Deploy tracking pixels and scripts without editing site code.", pricing: "Free" },
    ],
  },
  {
    name: "Email & audience",
    icon: "📧",
    tools: [
      { name: "Beehiiv", url: "https://beehiiv.com", blurb: "Modern newsletter platform with referral programs and monetization built in.", pricing: "Freemium" },
      { name: "Substack", url: "https://substack.com", blurb: "Free newsletter + paid subscriptions — you keep most of the revenue.", pricing: "Free" },
      { name: "Mailchimp", url: "https://mailchimp.com", blurb: "Email marketing with templates and automations; free up to 500 contacts.", pricing: "Freemium" },
      { name: "Kit (ConvertKit)", url: "https://kit.com", blurb: "Email built for creators — free plan up to 10,000 subscribers with landing pages.", pricing: "Freemium" },
      { name: "Carrd", url: "https://carrd.co", blurb: "Simple one-page sites for bio links, landing pages and portfolios — free for 3.", pricing: "Freemium" },
      { name: "Linktree", url: "https://linktr.ee", blurb: "One bio link page holding all your links — products, profiles, newsletter.", pricing: "Freemium" },
    ],
  },
  {
    name: "Affiliate & link management",
    icon: "🔗",
    tools: [
      { name: "Bitly", url: "https://bitly.com", blurb: "Shorten and track links — see clicks, geography and referrers.", pricing: "Freemium" },
      { name: "Impact", url: "https://impact.com", blurb: "Major affiliate network hosting programs from big brands — free to join.", pricing: "Free" },
      { name: "CJ Affiliate", url: "https://cj.com", blurb: "One of the largest affiliate networks — thousands of brands, free publisher signup.", pricing: "Free" },
      { name: "Awin", url: "https://awin.com", blurb: "Global affiliate network with 25,000+ advertisers across retail, travel and tech.", pricing: "Free" },
      { name: "Pretty Links", url: "https://prettylinks.com", blurb: "WordPress plugin to cloak, brand and track affiliate links on your own domain.", pricing: "Freemium" },
    ],
  },
  {
    name: "Automation",
    icon: "⚙️",
    tools: [
      { name: "Zapier", url: "https://zapier.com", blurb: "Connect apps and automate workflows; free plan covers a small monthly task quota.", pricing: "Freemium" },
      { name: "IFTTT", url: "https://ifttt.com/features/redeem?code=1357624-2be298e9b7471c5c950f3b2737263593", blurb: "Simple automations between services — auto-post, auto-share, auto-save. GoDesi partner code inside.", pricing: "Freemium", partner: true },
      { name: "Make", url: "https://www.make.com/en/register?pc=godesi", blurb: "Visual automation with 1,500+ app integrations and a generous free ops quota — GoDesi partner link.", pricing: "Freemium", partner: true },
      { name: "n8n", url: "https://n8n.io", blurb: "Open-source workflow automation you can self-host free — AI-ready with LLM nodes.", pricing: "Freemium" },
    ],
  },
  {
    name: "Office & paperwork",
    icon: "🗂️",
    tools: [
      { name: "eFax", url: "https://www.efax.com/lp/affiliate-five?VID=36258", blurb: "Send and receive faxes by email — no fax machine needed; signup discounts via GoDesi's partner link.", pricing: "Freemium", partner: true },
      { name: "DocHub", url: "https://dochub.com", blurb: "Fill, sign and edit PDFs in the browser — contracts and forms without printing.", pricing: "Freemium" },
      { name: "PDF24", url: "https://tools.pdf24.org", blurb: "Free PDF toolkit — merge, compress, convert, sign and OCR, no account needed.", pricing: "Free" },
    ],
  },
];
