"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/ui";
import {
  flightResultsUrl,
  hotelResultsUrl,
  type TravelPlace,
} from "@/lib/travel";

const AUTOCOMPLETE =
  "https://autocomplete.travelpayouts.com/places2?locale=en&types%5B%5D=airport&types%5B%5D=city&term=";

async function suggest(term: string): Promise<TravelPlace[]> {
  if (term.trim().length < 2) return [];
  try {
    const response = await fetch(AUTOCOMPLETE + encodeURIComponent(term));
    if (!response.ok) return [];
    const places = (await response.json()) as TravelPlace[];
    return Array.isArray(places) ? places.slice(0, 7) : [];
  } catch {
    return [];
  }
}

/** White-label dates are DDMM only — cap picks ~11 months out so they stay unambiguous. */
function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const MIN_DATE = isoDate();
const MAX_DATE = isoDate(330);

function placeLabel(place: TravelPlace): string {
  return `${place.name} (${place.code})`;
}

function PlaceField({
  label,
  placeholder,
  onPick,
}: {
  label: string;
  placeholder: string;
  onPick: (place: TravelPlace | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<TravelPlace | null>(null);
  const [options, setOptions] = useState<TravelPlace[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (picked && query === placeLabel(picked)) return;
    const id = setTimeout(() => {
      const seq = ++requestId.current;
      void suggest(query).then((places) => {
        if (seq === requestId.current) setOptions(places);
      });
    }, 250);
    return () => clearTimeout(id);
  }, [query, picked]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={box} className="relative">
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        className={inputClass}
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPicked(null);
          onPick(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        required
      />
      {open && options.length > 0 && !picked ? (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((place) => (
            <li key={`${place.type}-${place.code}-${place.name}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
                onClick={() => {
                  setPicked(place);
                  setQuery(placeLabel(place));
                  onPick(place);
                  setOpen(false);
                }}
              >
                <span className="font-medium">{placeLabel(place)}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {place.type === "city" ? "All airports" : place.city_name}
                  {place.country_name ? `, ${place.country_name}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const tabBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition-colors";

export function TravelSearch() {
  const [tab, setTab] = useState<"flights" | "hotels">("flights");
  const [from, setFrom] = useState<TravelPlace | null>(null);
  const [to, setTo] = useState<TravelPlace | null>(null);
  const [depart, setDepart] = useState("");
  const [back, setBack] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [city, setCity] = useState<TravelPlace | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState("");

  const searchFlights = (event: React.FormEvent) => {
    event.preventDefault();
    if (!from || !to) return;
    if (back && !depart) {
      setDateError("Pick a departure date too, or clear the return date.");
      return;
    }
    if (depart && back && back < depart) {
      setDateError("Return date must be after the departure date.");
      return;
    }
    setDateError("");
    window.open(
      flightResultsUrl({
        origin: from.code,
        destination: to.code,
        departDate: depart,
        returnDate: back,
        passengers,
      }),
      "_blank",
      "noopener",
    );
  };

  const searchHotels = (event: React.FormEvent) => {
    event.preventDefault();
    if (!city) return;
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Check-out must be after the check-in date.");
      return;
    }
    setDateError("");
    window.open(
      hotelResultsUrl({
        destination: city.name,
        checkIn,
        checkOut,
        adults: guests,
      }),
      "_blank",
      "noopener",
    );
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          className={`${tabBase} ${tab === "flights" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
          onClick={() => setTab("flights")}
        >
          ✈️ Flights
        </button>
        <button
          type="button"
          className={`${tabBase} ${tab === "hotels" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
          onClick={() => setTab("hotels")}
        >
          🏨 Hotels
        </button>
      </div>

      {tab === "flights" ? (
        <form
          onSubmit={searchFlights}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <PlaceField
            label="From"
            placeholder="New York, Newark…"
            onPick={setFrom}
          />
          <PlaceField
            label="To"
            placeholder="Delhi, Mumbai, Ahmedabad…"
            onPick={setTo}
          />
          <label className="block text-sm font-medium text-slate-700">
            Depart
            <input
              type="date"
              className={`${inputClass} mt-1`}
              min={MIN_DATE}
              max={MAX_DATE}
              value={depart}
              onChange={(event) => setDepart(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Return <span className="text-xs font-normal text-slate-400">(optional)</span>
            <input
              type="date"
              className={`${inputClass} mt-1`}
              min={depart || MIN_DATE}
              max={MAX_DATE}
              value={back}
              onChange={(event) => setBack(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Travellers
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={1}
                max={9}
                className={inputClass}
                value={passengers}
                onChange={(event) =>
                  setPassengers(Math.max(1, Number(event.target.value) || 1))
                }
              />
              <button
                type="submit"
                disabled={!from || !to}
                className="shrink-0 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Search
              </button>
            </div>
          </label>
        </form>
      ) : (
        <form
          onSubmit={searchHotels}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="sm:col-span-2">
            <PlaceField
              label="City or destination"
              placeholder="Mumbai, Goa, Jaipur…"
              onPick={setCity}
            />
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Check-in
            <input
              type="date"
              className={`${inputClass} mt-1`}
              min={MIN_DATE}
              max={MAX_DATE}
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Check-out
            <input
              type="date"
              className={`${inputClass} mt-1`}
              min={checkIn || MIN_DATE}
              max={MAX_DATE}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Guests
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                min={1}
                max={9}
                className={inputClass}
                value={guests}
                onChange={(event) =>
                  setGuests(Math.max(1, Number(event.target.value) || 1))
                }
              />
              <button
                type="submit"
                disabled={!city}
                className="shrink-0 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Search
              </button>
            </div>
          </label>
        </form>
      )}

      {dateError ? (
        <p className="mt-3 text-sm font-medium text-rose-600">{dateError}</p>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">
        Search opens GoDesi Travel — flight and hotel results from hundreds of
        airlines and booking sites, powered by our travel partner.
      </p>
    </div>
  );
}
