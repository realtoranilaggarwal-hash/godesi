import { db } from "../src/lib/db";

const STANDEE_PDF =
  "https://wui097wknpuic6dl.public.blob.vercel-storage.com/partner-kit/GoDesi-38x70-Standee.pdf";
const PRINTER_URL = "https://refer.bannerbuzz.com/x/LQ7NDh";

async function main() {
  const kit = await db.partnerKit.upsert({
    where: { id: "default" },
    update: { standeePdfUrl: STANDEE_PDF, printerUrl: PRINTER_URL },
    create: {
      id: "default",
      standeePdfUrl: STANDEE_PDF,
      printerUrl: PRINTER_URL,
      note: "Print it as a 38×70 in roll-up standee (retractable banner stand). Ask the printer for the stand with the print — it comes in one case you can carry to the venue.",
    },
  });
  console.log("partner kit", kit);

  const existing = await db.resourceLink.findFirst({
    where: { url: PRINTER_URL, placement: "event-suppliers" },
  });
  if (existing) {
    console.log("supplier link already there", existing.id);
    return;
  }
  const link = await db.resourceLink.create({
    data: {
      title: "BannerBuzz — banners, standees, flags & table covers",
      url: PRINTER_URL,
      description:
        "Print your event banner, roll-up standee or backdrop. Also prints the Godesi standee artwork.",
      placement: "event-suppliers",
      tags: ["events", "printing", "banners"],
      kind: "AFFILIATE",
      status: "APPROVED",
      active: true,
    },
  });
  console.log("supplier link", link.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
