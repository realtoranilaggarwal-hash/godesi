"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { confirmTicket, seatsLeft, ticketCode, uniqueEventSlug } from "@/lib/events";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

const eventSchema = z.object({
  title: z.string().trim().min(5, "Give your event a clear title"),
  description: z.string().trim().min(20, "Describe the event (20+ characters)"),
  date: z.string().trim().min(1, "Event date is required"),
  time: z.string().trim().min(1, "Event time is required"),
  venue: z.string().trim().min(3, "Venue is required"),
  city: z.string().trim().min(2, "City is required"),
  categorySlug: z.string().trim().optional(),
  subcategorySlug: z.string().trim().optional(),
  priceInr: z.coerce.number().int().min(0, "Price cannot be negative"),
  seatsTotal: z.coerce.number().int().min(1, "At least 1 seat is required"),
  imageUrl: optionalUrl,
});

export async function createEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const user = await requireUser();
    const parsed = eventSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      time: formData.get("time"),
      venue: formData.get("venue"),
      city: formData.get("city"),
      categorySlug: formData.get("categorySlug"),
      subcategorySlug: formData.get("subcategorySlug"),
      priceInr: formData.get("priceInr") || 0,
      seatsTotal: formData.get("seatsTotal") || 1,
      imageUrl: formData.get("imageUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const startsAt = new Date(`${parsed.data.date}T${parsed.data.time}:00+05:30`);
    if (Number.isNaN(startsAt.getTime())) return { error: "Enter a valid date and time." };

    const business = await db.business.findUnique({ where: { ownerId: user.id } });
    slug = await uniqueEventSlug(parsed.data.title, parsed.data.city);

    await db.event.create({
      data: {
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        startsAt,
        venue: parsed.data.venue,
        city: parsed.data.city,
        imageUrl: parsed.data.imageUrl ?? null,
        priceInr: parsed.data.priceInr,
        seatsTotal: parsed.data.seatsTotal,
        organizerId: user.id,
        businessId: business?.id ?? null,
        categorySlug: parsed.data.subcategorySlug || parsed.data.categorySlug || null,
      },
    });
  } catch (error) {
    return fieldError(error);
  }

  revalidatePath("/events");
  redirect(`/events/${slug}`);
}

const bookingSchema = z.object({
  eventId: z.string().min(1),
  quantity: z.coerce.number().int().min(1, "Book at least 1 seat").max(10, "Maximum 10 seats"),
  buyerName: z.string().trim().min(2, "Your name is required"),
  buyerEmail: z.string().trim().email("Enter a valid email"),
  buyerPhone: z.string().trim().optional(),
});

/**
 * Free events issue a confirmed ticket immediately; paid events create a PENDING
 * ticket and hand off to Stripe. Seats are only taken once payment is confirmed.
 */
export async function bookTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let destination: string;

  try {
    const user = await requireUser();
    const parsed = bookingSchema.safeParse({
      eventId: formData.get("eventId"),
      quantity: formData.get("quantity") || 1,
      buyerName: formData.get("buyerName") || user.name,
      buyerEmail: formData.get("buyerEmail") || user.email,
      buyerPhone: formData.get("buyerPhone"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({ where: { id: parsed.data.eventId } });
    if (!event) return { error: "This event no longer exists." };
    if (event.status !== "APPROVED") return { error: "This event is not open for booking." };
    if (event.startsAt.getTime() < Date.now()) return { error: "This event has already ended." };
    if (seatsLeft(event) < parsed.data.quantity) {
      return { error: `Only ${seatsLeft(event)} seat(s) left for this event.` };
    }

    const amount = event.priceInr * parsed.data.quantity;

    const ticket = await db.ticket.create({
      data: {
        code: ticketCode(),
        eventId: event.id,
        userId: user.id,
        buyerName: parsed.data.buyerName,
        buyerEmail: parsed.data.buyerEmail,
        buyerPhone: parsed.data.buyerPhone || null,
        quantity: parsed.data.quantity,
        amount,
        currency: "INR",
        provider: event.priceInr === 0 ? "free" : "stripe",
      },
    });

    if (event.priceInr === 0) {
      await confirmTicket({
        ticketId: ticket.id,
        provider: "free",
        reference: `free_${ticket.id}`,
        amount: 0,
        currency: "INR",
      });
      destination = `/tickets/${ticket.code}`;
    } else {
      if (!stripeEnabled()) {
        return { error: "Ticket payments are not configured yet. Please try later." };
      }

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: parsed.data.buyerEmail,
        client_reference_id: user.id,
        metadata: { kind: "ticket", ticketId: ticket.id, eventId: event.id },
        line_items: [
          {
            quantity: parsed.data.quantity,
            price_data: {
              currency: "inr",
              unit_amount: event.priceInr * 100,
              product_data: {
                name: `${event.title} — ticket`,
                description: `${event.venue}, ${event.city}`,
              },
            },
          },
        ],
        success_url: `${siteUrl()}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/events/${event.slug}?error=cancelled`,
      });

      if (!session.url) return { error: "We could not start the payment. Please try again." };
      destination = session.url;
    }
  } catch (error) {
    return fieldError(error);
  }

  revalidatePath("/events");
  redirect(destination);
}

export async function cancelEventAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const event = await db.event.findUnique({ where: { id } });
  if (!event || (event.organizerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("FORBIDDEN");
  }
  await db.event.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
}
