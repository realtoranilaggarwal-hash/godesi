/**
 * GoDesi Travel — the Travelpayouts White Label served at travel.godesi.com.
 * The box on /travel sends searches there; bookings and commissions stay on
 * the partner's white-label site under the GoDesi brand.
 */
export const TRAVEL_WHITELABEL = "https://travel.godesi.com";

export type TravelPlace = {
  code: string;
  name: string;
  type: string;
  city_name?: string;
  country_name?: string;
};

/** DDMM from a <input type="date"> value (yyyy-mm-dd). */
function ddmm(date: string): string {
  return `${date.slice(8, 10)}${date.slice(5, 7)}`;
}

/**
 * White-label flight results URL — /flights/{ORIGIN}{DDMM}{DEST}[{DDMM}]{PAX}
 * e.g. EWR0112DEL15012 = Newark → Delhi, Dec 1, return Dec 15, 2 passengers.
 */
export function flightResultsUrl({
  origin,
  destination,
  departDate,
  returnDate,
  passengers,
}: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
}): string {
  let path = origin.trim().toUpperCase();
  if (departDate) path += ddmm(departDate);
  path += destination.trim().toUpperCase();
  if (returnDate) path += ddmm(returnDate);
  path += String(Math.max(1, passengers));
  return `${TRAVEL_WHITELABEL}/flights/${path}`;
}

/**
 * Hotel results on Booking.com. The white label lost its hotel search when
 * Hotellook closed (Oct 2025), so travel.godesi.com/hotels is a 404.
 */
export function hotelResultsUrl({
  destination,
  checkIn,
  checkOut,
  adults,
}: {
  destination: string;
  checkIn?: string;
  checkOut?: string;
  adults: number;
}): string {
  const params = new URLSearchParams({
    ss: destination,
    group_adults: String(Math.max(1, adults)),
    no_rooms: "1",
    selected_currency: "USD",
    lang: "en-us",
  });
  if (checkIn) params.set("checkin", checkIn);
  if (checkOut) params.set("checkout", checkOut);
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
