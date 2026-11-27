/* eslint-disable jsx-a11y/alt-text -- react-pdf <Image> is not an HTML img and takes no alt. */
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/format";
import { AUTHOR_NAME, type Course } from "@/lib/courses";

const SLATE = "#0f172a";
const AMBER = "#f59e0b";
const INDIGO = "#1e1b4b";

const styles = StyleSheet.create({
  cover: { backgroundColor: SLATE, color: "#ffffff", padding: 48, fontFamily: "Helvetica" },
  coverBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  coverLogo: { width: 36, height: 36 },
  coverBrandText: { fontSize: 14, fontFamily: "Helvetica-Bold", color: AMBER, letterSpacing: 2 },
  coverImage: { marginTop: 28, width: "100%", height: 300, objectFit: "cover", borderRadius: 12 },
  coverKicker: { marginTop: 28, fontSize: 11, color: AMBER, fontFamily: "Helvetica-Bold", letterSpacing: 2 },
  coverTitle: { marginTop: 8, fontSize: 30, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  coverTagline: { marginTop: 12, fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 },
  coverAuthor: { marginTop: 24, fontSize: 12, fontFamily: "Helvetica-Bold" },
  coverFooter: { position: "absolute", bottom: 36, left: 48, right: 48, fontSize: 9, color: "#94a3b8" },
  page: { paddingTop: 56, paddingBottom: 64, paddingHorizontal: 56, fontSize: 11, color: "#1e293b", fontFamily: "Helvetica", lineHeight: 1.55 },
  header: { position: "absolute", top: 24, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
  footer: { position: "absolute", bottom: 28, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
  h1: { fontSize: 22, fontFamily: "Helvetica-Bold", color: SLATE, marginBottom: 14 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", color: SLATE, marginTop: 14, marginBottom: 4 },
  tocRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tocTitle: { flex: 1, paddingRight: 12 },
  muted: { color: "#64748b" },
  lessonKicker: { fontSize: 9, color: AMBER, fontFamily: "Helvetica-Bold", letterSpacing: 1.5 },
  lessonTitle: { fontSize: 20, fontFamily: "Helvetica-Bold", color: SLATE, marginTop: 4, marginBottom: 4, lineHeight: 1.25 },
  paragraph: { marginTop: 9 },
  bullet: { flexDirection: "row", marginTop: 5, paddingLeft: 6 },
  bulletDot: { width: 12, color: AMBER, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1 },
  backQr: { width: 170, height: 170, marginTop: 18 },
  link: { color: "#4f46e5", textDecoration: "none" },
});

/** The built-in PDF fonts only cover Latin-1, so symbols get plain-text stand-ins and emoji are dropped. */
export function pdfText(value: string) {
  return value
    .replace(/→/g, "->")
    .replace(/−/g, "-")
    .replace(/≈/g, "~")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/[^\u0000-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u20ac\u2122]/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** Reads a /public image from disk; the ebook route traces these files into its bundle. */
async function imageData(publicPath: string) {
  try {
    const data = await readFile(path.join(process.cwd(), "public", publicPath));
    return { data, format: publicPath.endsWith(".png") ? "png" : "jpg" } as const;
  } catch {
    return null;
  }
}

function Chrome({ course, licensee }: { course: Course; licensee: string }) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text>GoDesi.com · {pdfText(course.title)}</Text>
        <Text>{AUTHOR_NAME}</Text>
      </View>
      <View style={styles.footer} fixed>
        <Text>Licensed to {pdfText(licensee)} · personal use only, not for resale</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </>
  );
}

/** A course's lessons as a downloadable PDF ebook, stamped with the buyer's name. */
export async function renderCourseEbook(course: Course, licensee: string) {
  const catalogUrl = `${siteUrl()}/course?src=ebook`;
  const [cover, logo, qr] = await Promise.all([
    imageData(course.cover),
    imageData("/qr-logo.png"),
    QRCode.toDataURL(catalogUrl, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: INDIGO, light: "#ffffff" },
    }),
  ]);
  const totalMinutes = course.lessons.reduce((sum, l) => sum + l.minutes, 0);
  const title = pdfText(course.title);

  const doc = (
    <Document title={title} author={AUTHOR_NAME} subject={pdfText(course.tagline)} creator="GoDesi.com" producer="GoDesi.com">
      <Page size="LETTER" style={styles.cover}>
        <View style={styles.coverBrand}>
          {logo ? <Image src={logo} style={styles.coverLogo} /> : null}
          <Text style={styles.coverBrandText}>GODESI COURSES · EBOOK</Text>
        </View>
        {cover ? <Image src={cover} style={styles.coverImage} /> : null}
        <Text style={styles.coverKicker}>
          {course.lessons.length} LESSONS · ABOUT {Math.max(1, Math.round(totalMinutes / 5) * 5)} MINUTES
        </Text>
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverTagline}>{pdfText(course.tagline)}</Text>
        <Text style={styles.coverAuthor}>by {AUTHOR_NAME}</Text>
        <Text style={styles.coverFooter}>
          GoDesi.com · Licensed to {pdfText(licensee)} · personal use only, not for resale
        </Text>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Chrome course={course} licensee={licensee} />
        <Text style={styles.h1}>What you will learn</Text>
        <Text>{pdfText(course.pitch)}</Text>
        {course.highlights.map((h) => (
          <View key={h.title} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{pdfText(h.title)}: </Text>
              {pdfText(h.body)}
            </Text>
          </View>
        ))}
        <Text style={[styles.h2, { marginTop: 26 }]}>Contents</Text>
        {course.lessons.map((lesson, i) => (
          <View key={lesson.title} style={styles.tocRow}>
            <Text style={styles.tocTitle}>
              {i + 1}. {pdfText(lesson.title)}
            </Text>
            <Text style={styles.muted}>{lesson.minutes} min</Text>
          </View>
        ))}
      </Page>

      {course.lessons.map((lesson, i) => (
        <Page key={lesson.title} size="LETTER" style={styles.page}>
          <Chrome course={course} licensee={licensee} />
          <Text style={styles.lessonKicker}>
            LESSON {i + 1} OF {course.lessons.length} · {lesson.minutes} MIN
          </Text>
          <Text style={styles.lessonTitle}>{pdfText(lesson.title)}</Text>
          {lesson.paragraphs.map((p, j) => (
            <Text key={j} style={styles.paragraph}>
              {pdfText(p)}
            </Text>
          ))}
          {lesson.bullets?.length ? (
            <View style={{ marginTop: 8 }}>
              {lesson.bullets.map((b, j) => (
                <View key={j} style={styles.bullet} wrap={false}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{pdfText(b)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Page>
      ))}

      <Page size="LETTER" style={styles.page}>
        <Chrome course={course} licensee={licensee} />
        <Text style={styles.h1}>Keep learning on GoDesi</Text>
        <Text>
          Every GoDesi course comes with its ebook. Scan the code or visit{" "}
          <Link src={catalogUrl} style={styles.link}>
            GoDesi.com/course
          </Link>{" "}
          to pick your next income skill.
        </Text>
        <Image src={qr} style={styles.backQr} />
        <Text style={[styles.paragraph, styles.muted]}>
          This ebook is educational, not financial, legal or tax advice. Results vary with effort and market conditions.
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
