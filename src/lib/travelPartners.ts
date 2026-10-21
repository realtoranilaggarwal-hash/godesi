/**
 * Travelpayouts partner programs shown on /travel. Links go to the brand's own
 * site on purpose — the Travelpayouts "Drive" script loaded in the site <head>
 * rewrites brand links into affiliate links with our partner marker on click.
 */
export type TravelPartner = {
  name: string;
  emoji: string;
  blurb: string;
  url: string;
};

export type TravelPartnerGroup = {
  title: string;
  emoji: string;
  partners: TravelPartner[];
};

export const TRAVEL_PARTNER_GROUPS: TravelPartnerGroup[] = [
  {
    title: "eSIM & connectivity",
    emoji: "📱",
    partners: [
      {
        name: "Airalo",
        emoji: "📶",
        blurb: "Data eSIMs for 200+ countries — land in India connected.",
        url: "https://www.airalo.com/",
      },
      {
        name: "Saily",
        emoji: "🌐",
        blurb: "Simple travel eSIM app from the NordVPN team.",
        url: "https://saily.com/",
      },
      {
        name: "Yesim",
        emoji: "💳",
        blurb: "eSIM plans with pay-as-you-go pricing for India trips.",
        url: "https://yesim.app/",
      },
      {
        name: "Drimsim",
        emoji: "🧳",
        blurb: "One physical SIM that works across countries, no roaming shock.",
        url: "https://drimsim.com/",
      },
      {
        name: "GigSky",
        emoji: "✈️",
        blurb: "eSIM data plans that also work on flights and cruises.",
        url: "https://www.gigsky.com/",
      },
    ],
  },
  {
    title: "Airport transfers & taxis",
    emoji: "🚖",
    partners: [
      {
        name: "Kiwitaxi",
        emoji: "🚕",
        blurb: "Pre-booked airport pickup — driver meets you at arrivals.",
        url: "https://kiwitaxi.com/",
      },
      {
        name: "Welcome Pickups",
        emoji: "👋",
        blurb: "English-friendly airport transfers with a local driver.",
        url: "https://www.welcomepickups.com/",
      },
      {
        name: "GetTransfer",
        emoji: "🚗",
        blurb: "Drivers bid on your route — pick the cheapest airport ride.",
        url: "https://gettransfer.com/",
      },
      {
        name: "intui.travel",
        emoji: "🚌",
        blurb: "Airport shuttles and private transfers in 175+ countries.",
        url: "https://en.intui.travel/",
      },
    ],
  },
  {
    title: "Car & bike rentals",
    emoji: "🚙",
    partners: [
      {
        name: "EconomyBookings",
        emoji: "💰",
        blurb: "Compares rental deals from all the big car hire brands.",
        url: "https://www.economybookings.com/",
      },
      {
        name: "GetRentacar",
        emoji: "🚘",
        blurb: "Rent cars directly from local owners and small fleets.",
        url: "https://getrentacar.com/",
      },
      {
        name: "Localrent",
        emoji: "🏪",
        blurb: "Local rental companies with low deposits in tourist cities.",
        url: "https://localrent.com/",
      },
      {
        name: "BikesBooking",
        emoji: "🏍️",
        blurb: "Scooters and motorbikes for trips around Goa and beyond.",
        url: "https://www.bikesbooking.com/",
      },
      {
        name: "AutoEurope",
        emoji: "🇪🇺",
        blurb: "Long-running broker for car rentals across Europe.",
        url: "https://www.autoeurope.com/",
      },
    ],
  },
  {
    title: "Tours, tickets & activities",
    emoji: "🎡",
    partners: [
      {
        name: "Klook",
        emoji: "🎢",
        blurb: "Tours, trains, SIMs and attraction tickets across Asia.",
        url: "https://www.klook.com/",
      },
      {
        name: "KKday",
        emoji: "🗺️",
        blurb: "Local experiences and day tours, strong in Asia.",
        url: "https://www.kkday.com/",
      },
      {
        name: "Tiqets",
        emoji: "🎟️",
        blurb: "Skip-the-line tickets for museums and attractions worldwide.",
        url: "https://www.tiqets.com/",
      },
      {
        name: "Go City",
        emoji: "🏙️",
        blurb: "All-inclusive city passes covering the top sights.",
        url: "https://gocity.com/",
      },
      {
        name: "WeGoTrip",
        emoji: "🎧",
        blurb: "Self-guided audio tours you play on your phone.",
        url: "https://wegotrip.com/",
      },
    ],
  },
  {
    title: "Flight problems & extras",
    emoji: "🛟",
    partners: [
      {
        name: "AirHelp",
        emoji: "⚖️",
        blurb: "Get compensation when your flight is delayed or cancelled.",
        url: "https://www.airhelp.com/",
      },
      {
        name: "Compensair",
        emoji: "💸",
        blurb: "Claims service for delayed, cancelled or overbooked flights.",
        url: "https://compensair.com/",
      },
      {
        name: "Radical Storage",
        emoji: "🎒",
        blurb: "Leave bags in local shops while you explore between flights.",
        url: "https://radicalstorage.com/",
      },
      {
        name: "QEEQ",
        emoji: "🛒",
        blurb: "Car rental deals platform with price-drop rebooking.",
        url: "https://www.qeeq.com/",
      },
    ],
  },
];
