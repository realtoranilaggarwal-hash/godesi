/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> is not an HTML img and takes no alt. */
import { Document, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { pdfText } from "@/lib/courseEbook";
import { siteUrl } from "@/lib/format";
import { memberEbookCover, type MemberEbook } from "@/lib/memberEbooks";

const SLATE = "#0f172a";
const AMBER = "#f59e0b";

const styles = StyleSheet.create({
  cover: { backgroundColor: SLATE, color: "#ffffff", padding: 48, fontFamily: "Helvetica" },
  brand: { fontSize: 12, fontFamily: "Helvetica-Bold", color: AMBER, letterSpacing: 2 },
  coverImage: { marginTop: 24, width: "100%", height: 320, objectFit: "contain" },
  coverTitle: { marginTop: 24, fontSize: 28, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  coverSub: { marginTop: 10, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 },
  coverAuthor: { marginTop: 20, fontSize: 12, fontFamily: "Helvetica-Bold" },
  coverFooter: { position: "absolute", bottom: 36, left: 48, right: 48, fontSize: 9, color: "#94a3b8" },
  page: { paddingTop: 56, paddingBottom: 64, paddingHorizontal: 56, fontSize: 11, color: "#1e293b", fontFamily: "Helvetica", lineHeight: 1.55 },
  header: { position: "absolute", top: 24, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
  footer: { position: "absolute", bottom: 28, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: SLATE, marginBottom: 8, lineHeight: 1.25 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: SLATE, marginTop: 16, marginBottom: 4 },
  paragraph: { marginTop: 9 },
  bullet: { flexDirection: "row", marginTop: 5, paddingLeft: 6 },
  dot: { width: 14, color: AMBER, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1 },
  link: { color: "#4f46e5", textDecoration: "none" },
  qr: { width: 160, height: 160, marginTop: 16 },
});

async function publicImage(publicPath: string) {
  try {
    return { data: await readFile(path.join(process.cwd(), "public", publicPath)), format: publicPath.endsWith(".png") ? "png" : "jpg" } as const;
  } catch {
    return null;
  }
}

/** The stored PDF for file-based ebooks, else the chapters rendered to a PDF stamped with the reader's name. */
export async function memberEbookPdf(book: MemberEbook, licensee: string): Promise<Buffer> {
  if (book.file) return readFile(path.join(process.cwd(), book.file));
  const shelfUrl = `${siteUrl()}/${book.owner}?src=ebook`;
  const [cover, qr] = await Promise.all([
    publicImage(memberEbookCover(book)),
    QRCode.toDataURL(shelfUrl, { width: 600, margin: 1, errorCorrectionLevel: "H" }),
  ]);
  const title = pdfText(book.title);
  const chrome = (
    <>
      <View style={styles.header} fixed>
        <Text>GoDesi.com · {title}</Text>
        <Text>{book.ownerName}</Text>
      </View>
      <View style={styles.footer} fixed>
        <Text>Licensed to {pdfText(licensee)} · personal use only, not for resale</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
  const bullet = (text: string, key: number, mark = "•") => (
    <View key={key} style={styles.bullet} wrap={false}>
      <Text style={styles.dot}>{mark}</Text>
      <Text style={styles.bulletText}>{pdfText(text)}</Text>
    </View>
  );

  const doc = (
    <Document title={title} author={book.ownerName} subject={pdfText(book.subtitle)} creator="GoDesi.com" producer="GoDesi.com">
      <Page size="LETTER" style={styles.cover}>
        <Text style={styles.brand}>GODESI EBOOKS · {pdfText(book.audience).toUpperCase()}</Text>
        {cover ? <Image src={cover} style={styles.coverImage} /> : null}
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSub}>{pdfText(book.subtitle)}</Text>
        <Text style={styles.coverAuthor}>by {book.ownerName}</Text>
        <Text style={styles.coverFooter}>GoDesi.com · Licensed to {pdfText(licensee)} · personal use only, not for resale</Text>
      </Page>

      <Page size="LETTER" style={styles.page}>
        {chrome}
        <Text style={styles.h1}>What&apos;s inside</Text>
        <Text>{pdfText(book.pitch)}</Text>
        {book.bullets.map((b, i) => bullet(b, i))}
        <Text style={[styles.h2, { marginTop: 24 }]}>Contents</Text>
        {book.chapters.map((c, i) => (
          <Text key={i} style={{ marginTop: 4 }}>
            {pdfText(c.title)}
          </Text>
        ))}
      </Page>

      {book.chapters.map((chapter, i) => (
        <Page key={i} size="LETTER" style={styles.page}>
          {chrome}
          <Text style={styles.h1}>{pdfText(chapter.title)}</Text>
          {chapter.body.map((p, j) => (
            <Text key={j} style={styles.paragraph}>
              {pdfText(p)}
            </Text>
          ))}
          {chapter.checklist?.length ? (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.h2}>Checklist</Text>
              {chapter.checklist.map((c, j) => bullet(c, j, "[ ]"))}
            </View>
          ) : null}
        </Page>
      ))}

      <Page size="LETTER" style={styles.page}>
        {chrome}
        {book.products?.length ? (
          <>
            <Text style={styles.h1}>Helpful products</Text>
            <Text style={{ fontSize: 9, color: "#64748b" }}>Affiliate links: the author may earn a small commission at no cost to you.</Text>
            {book.products.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                <Link src={p.url} style={styles.link}>{pdfText(p.label)}</Link> — {pdfText(p.note)}
              </Text>
            ))}
          </>
        ) : null}
        {book.sources?.length ? (
          <>
            <Text style={styles.h2}>Sources</Text>
            {book.sources.map((s, i) => (
              <Text key={i} style={{ marginTop: 3, fontSize: 9 }}>
                <Link src={s.url} style={styles.link}>{pdfText(s.label)}</Link>
              </Text>
            ))}
          </>
        ) : null}
        <Text style={[styles.h1, { marginTop: 24 }]}>More ebooks on GoDesi</Text>
        <Text>
          Scan the code or visit{" "}
          <Link src={shelfUrl} style={styles.link}>GoDesi.com/{book.owner}</Link> for {book.ownerName}&apos;s other guides.
        </Text>
        <Image src={qr} style={styles.qr} />
        <Text style={[styles.paragraph, { color: "#64748b" }]}>
          This ebook is general education, not legal, tax or financial advice. Laws change; check with a licensed professional for your situation.
        </Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
