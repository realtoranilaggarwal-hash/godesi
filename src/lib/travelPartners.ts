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
        url: "https://airalo.tpo.li/kCjBQrU7",
      },
      {
        name: "Saily",
        emoji: "🌐",
        blurb: "Simple travel eSIM app from the NordVPN team.",
        url: "https://saily.tpo.li/zj3bsd4S",
      },
      {
        name: "Yesim",
        emoji: "💳",
        blurb: "eSIM plans with pay-as-you-go pricing for India trips.",
        url: "https://yesim.tpo.li/h8PsXZWL",
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
        url: "https://gigsky.tpo.li/C3uJ5Cz0",
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
        url: "https://tpo.li/5k2M3E7T",
      },
      {
        name: "GetTransfer",
        emoji: "🚗",
        blurb: "Drivers bid on your route — pick the cheapest airport ride.",
        url: "https://gettransfer.tpo.li/JidQ8jrG",
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
        url: "https://autoeurope.tpo.li/H3AtR2Rd",
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
        url: "https://klook.tpo.li/i4EpjUQO",
      },
      {
        name: "KKday",
        emoji: "🗺️",
        blurb: "Local experiences and day tours, strong in Asia.",
        url: "https://kkday.tpo.li/KQVeXH2b",
      },
      {
        name: "Tiqets",
        emoji: "🎟️",
        blurb: "Skip-the-line tickets for museums and attractions worldwide.",
        url: "https://tiqets.tpo.li/E3DJJc1N",
      },
      {
        name: "Go City",
        emoji: "🏙️",
        blurb: "All-inclusive city passes covering the top sights.",
        url: "https://gocity.tpo.li/AUimH1Tz",
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
        name: "Kiwi.com",
        emoji: "🥝",
        blurb: "Flight search that mixes airlines for the cheapest routes.",
        url: "https://kiwi.tpo.li/cuiHsNTQ",
      },
      {
        name: "AirHelp",
        emoji: "⚖️",
        blurb: "Get compensation when your flight is delayed or cancelled.",
        url: "https://airhelp.tpo.li/4iaov6dm",
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
        url: "https://qeeq.tpo.li/lV4XW1QX",
      },
    ],
  },
];
