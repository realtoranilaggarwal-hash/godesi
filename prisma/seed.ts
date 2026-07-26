import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await db.user.upsert({
    where: { email: "admin@godesi.in" },
    update: { role: "ADMIN", passwordHash: password },
    create: {
      email: "admin@godesi.in",
      name: "Godesi Admin",
      role: "ADMIN",
      passwordHash: password,
    },
  });

  const businesses = [
    {
      email: "sweetcrumbs@example.com",
      name: "Priya Sharma",
      plan: "PREMIUM" as const,
      business: {
        name: "Sweet Crumbs Bakery",
        category: "Bakery",
        city: "Jaipur",
        state: "Rajasthan",
        description:
          "Custom cakes, cupcakes and eggless treats baked fresh daily. Home delivery across Jaipur.",
        whatsappNumber: "919812345670",
        phone: "+919812345670",
        websiteUrl: "https://example.com",
        instagramUrl: "https://instagram.com/sweetcrumbs",
        mapsUrl: "https://maps.google.com/?q=Jaipur",
        address: "12 MI Road, Jaipur",
        logoUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
        featured: true,
        status: "APPROVED" as const,
      },
      media: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
      ],
    },
    {
      email: "sparkelectric@example.com",
      name: "Rahul Verma",
      plan: "PRO" as const,
      business: {
        name: "Spark Electricals",
        category: "Electrician",
        city: "Pune",
        state: "Maharashtra",
        description:
          "Licensed electricians for homes and offices. Wiring, repairs, inverter and fan installation.",
        whatsappNumber: "919898765432",
        phone: "+919898765432",
        mapsUrl: "https://maps.google.com/?q=Pune",
        address: "45 FC Road, Pune",
        featured: true,
        status: "APPROVED" as const,
      },
      media: ["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800"],
    },
    {
      email: "printhub@example.com",
      name: "Anita Desai",
      plan: "FREE" as const,
      business: {
        name: "PrintHub Solutions",
        category: "Printing",
        city: "Ahmedabad",
        state: "Gujarat",
        description:
          "Wedding cards, visiting cards, banners and bulk printing at wholesale rates.",
        whatsappNumber: "919700011122",
        status: "APPROVED" as const,
      },
      media: [],
    },
    {
      email: "greengarden@example.com",
      name: "Suresh Nair",
      plan: "FREE" as const,
      business: {
        name: "Green Garden Nursery",
        category: "Gardening",
        city: "Kochi",
        state: "Kerala",
        description: "Indoor plants, pots and landscaping services.",
        whatsappNumber: "919656565656",
        status: "PENDING" as const,
      },
      media: [],
    },
  ];

  for (const entry of businesses) {
    const owner = await db.user.upsert({
      where: { email: entry.email },
      update: { plan: entry.plan, passwordHash: password },
      create: {
        email: entry.email,
        name: entry.name,
        role: "BUSINESS",
        plan: entry.plan,
        planExpiresAt:
          entry.plan === "FREE" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        passwordHash: password,
      },
    });

    const slug = entry.business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const business = await db.business.upsert({
      where: { ownerId: owner.id },
      update: entry.business,
      create: { ...entry.business, slug, ownerId: owner.id },
    });

    await db.media.deleteMany({ where: { businessId: business.id } });
    await Promise.all(
      entry.media.map((url, index) =>
        db.media.create({
          data: { businessId: business.id, url, type: "IMAGE", sortOrder: index },
        }),
      ),
    );

    await db.review.deleteMany({ where: { businessId: business.id } });
    await db.review.createMany({
      data: [
        {
          businessId: business.id,
          authorName: "Happy Customer",
          rating: 5,
          comment: "Excellent service and very responsive on WhatsApp!",
        },
        {
          businessId: business.id,
          authorName: "Regular Client",
          rating: 4,
          comment: "Good quality, will order again.",
        },
      ],
    });

    await db.event.createMany({
      data: [
        ...Array.from({ length: 20 }, () => ({
          businessId: business.id,
          type: "PROFILE_VIEW" as const,
        })),
        ...Array.from({ length: 6 }, () => ({
          businessId: business.id,
          type: "QR_SCAN" as const,
        })),
        ...Array.from({ length: 9 }, () => ({
          businessId: business.id,
          type: "WHATSAPP_CLICK" as const,
        })),
      ],
    });
  }

  const client = await db.user.upsert({
    where: { email: "client@example.com" },
    update: { role: "CLIENT", passwordHash: password },
    create: {
      email: "client@example.com",
      name: "Meena Iyer",
      role: "CLIENT",
      passwordHash: password,
    },
  });

  const leads = [
    {
      title: "Need 500 wedding invitation cards printed",
      description:
        "Looking for premium wedding cards with gold foil. Need delivery within 2 weeks in Ahmedabad.",
      category: "Printing",
      city: "Ahmedabad",
      budgetMin: 15000,
      budgetMax: 30000,
    },
    {
      title: "Custom birthday cake for 50 people",
      description: "Eggless chocolate cake with a superhero theme for my son's birthday.",
      category: "Bakery",
      city: "Jaipur",
      budgetMin: 3000,
      budgetMax: 6000,
    },
    {
      title: "Full home electrical rewiring",
      description: "3BHK flat needs complete rewiring and new switchboards.",
      category: "Electrician",
      city: "Pune",
      budgetMin: 40000,
      budgetMax: 70000,
    },
  ];

  await db.lead.deleteMany({ where: { clientId: client.id } });
  for (const lead of leads) {
    await db.lead.create({
      data: {
        ...lead,
        clientId: client.id,
        contactName: client.name,
        contactPhone: "+919812300000",
        contactEmail: client.email,
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seed complete. Admin:", admin.email, "/ password: password123");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
