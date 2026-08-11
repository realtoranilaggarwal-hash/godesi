import { shell } from "@/lib/email";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/format";

/**
 * Ready-made notes the members desk can send a member: an upgrade nudge, a
 * reminder to finish their card, or a plain hello with the phone number.
 */
export type MemberEmailTemplate = {
  key: string;
  label: string;
  subject: string;
  body: (name: string) => string;
};

const signOff = `<p style="margin:20px 0 0;color:#334155">Namaste,<br/>${SITE.name} team<br/>
<a href="mailto:${SITE.supportEmail}" style="color:#4f46e5">${SITE.supportEmail}</a></p>`;

function paragraphs(lines: string[]) {
  return lines
    .map(
      (line) =>
        `<p style="margin:0 0 14px;color:#334155;line-height:1.6">${line}</p>`,
    )
    .join("");
}

function button(href: string, label: string) {
  return `<p style="margin:0 0 16px"><a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:12px">${label}</a></p>`;
}

export const MEMBER_EMAIL_TEMPLATES: MemberEmailTemplate[] = [
  {
    key: "upgrade",
    label: "Invite to upgrade",
    subject: "Get your Godesi listing seen by more desi customers",
    body: (name) =>
      paragraphs([
        `Namaste ${name},`,
        "Your free listing on Godesi is doing its job — the paid package puts it in front of many more people: featured placement in your category, a rotating banner on the site, unlimited enquiries and Elite consideration, all in one price.",
      ]) +
      button(`${siteUrl()}/upgrade`, "See what is included") +
      paragraphs([
        "If you would rather talk it through, just reply to this email and we will call you.",
      ]) +
      signOff,
  },
  {
    key: "post-business",
    label: "Reminder: finish your business card",
    subject: "Finish your free Godesi business card",
    body: (name) =>
      paragraphs([
        `Namaste ${name},`,
        "You created a Godesi account but your business card is not finished yet. It takes two minutes, it stays free, and it gives you a page with your photos, timings, WhatsApp button and a QR code you can print.",
      ]) +
      button(`${siteUrl()}/dashboard/profile`, "Finish my card") +
      signOff,
  },
  {
    key: "post-anything",
    label: "Invite to post an event / property / requirement",
    subject: "Post your event, property or requirement free on Godesi",
    body: (name) =>
      paragraphs([
        `Namaste ${name},`,
        "Anything you want the desi community to see can go on Godesi free — an event with tickets, a flat or room to rent, something to sell, or a requirement you want quotes for.",
      ]) +
      button(`${siteUrl()}/post`, "Post it free") +
      signOff,
  },
  {
    key: "verify",
    label: "Reminder: confirm your email",
    subject: "Confirm your email to publish on Godesi",
    body: (name) =>
      paragraphs([
        `Namaste ${name},`,
        "Your Godesi account is waiting on one step: confirming your email address. Until then your listings stay unpublished.",
      ]) +
      button(`${siteUrl()}/verify-email`, "Confirm my email") +
      signOff,
  },
  {
    key: "hello",
    label: "Any questions? (plain hello)",
    subject: "Anything we can help with on Godesi?",
    body: (name) =>
      paragraphs([
        `Namaste ${name},`,
        "This is a quick hello from the Godesi team. If you have any questions about your listing, posting an event, or getting more enquiries, reply to this email and we will help — or ask us to call you.",
      ]) + signOff,
  },
];

export function memberEmailTemplate(key: string) {
  return MEMBER_EMAIL_TEMPLATES.find((template) => template.key === key) ?? null;
}

/** Wraps a subject and plain-text body written by hand in the Godesi shell. */
export function customMemberEmail(subject: string, text: string) {
  const html = shell(
    subject,
    paragraphs(text.split(/\n{2,}/).map((block) => block.replace(/\n/g, "<br/>"))) +
      signOff,
  );
  return { subject, html };
}

export function renderMemberEmail(template: MemberEmailTemplate, name: string) {
  return {
    subject: template.subject,
    html: shell(template.subject, template.body(name)),
  };
}
