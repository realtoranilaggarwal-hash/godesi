/**
 * Cars & Bikes listing fields. One definition drives the posting dropdowns, the
 * search filters and the tags on the card, so a value can never be listed that
 * nobody can filter by.
 */
export const VEHICLE_SUBCATEGORY = "buy-sell-cars-and-bikes";

export const VEHICLE_TYPES = [
  "Car",
  "SUV",
  "Truck / Pickup",
  "Van / Minivan",
  "Motorcycle",
  "Scooter",
  "Commercial vehicle",
] as const;

export const FUEL_TYPES = [
  "Petrol / Gas",
  "Diesel",
  "Hybrid",
  "Electric",
  "CNG",
  "Plug-in hybrid",
] as const;

export const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "Semi-automatic"] as const;

export const OWNERSHIPS = [
  "First owner",
  "Second owner",
  "Third owner",
  "Fourth owner or more",
] as const;

export const CONDITIONS = [
  "New",
  "Like new",
  "Excellent",
  "Good",
  "Fair",
  "Needs work / salvage",
] as const;

export const MILEAGE_UNITS = ["mi", "km"] as const;

export const VEHICLE_FEATURES = [
  "Air conditioning",
  "Power steering",
  "Power windows",
  "Sunroof / moonroof",
  "Bluetooth",
  "Apple CarPlay / Android Auto",
  "Backup camera",
  "Parking sensors",
  "Cruise control",
  "Leather seats",
  "Heated seats",
  "Navigation",
  "Alloy wheels",
  "Third-row seating",
  "Towing package",
  "Keyless entry",
  "ABS",
  "Airbags",
  "Adaptive cruise / lane assist",
  "Roof rack",
] as const;

/** Makes and their models — picking a make filters the model dropdown. */
export const VEHICLE_MAKES: Record<string, string[]> = {
  Acura: ["ILX", "MDX", "RDX", "TLX", "Integra"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "e-tron"],
  BMW: ["2 Series", "3 Series", "5 Series", "X1", "X3", "X5", "X7", "i4"],
  Chevrolet: ["Malibu", "Equinox", "Traverse", "Tahoe", "Silverado", "Bolt", "Camaro"],
  Chrysler: ["300", "Pacifica"],
  Dodge: ["Charger", "Challenger", "Durango", "Grand Caravan"],
  Ford: ["Escape", "Explorer", "Edge", "F-150", "Mustang", "Bronco", "Fusion"],
  GMC: ["Acadia", "Terrain", "Sierra", "Yukon"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Pilot", "Odyssey", "Ridgeline"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Ioniq 5"],
  Infiniti: ["Q50", "QX50", "QX60"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator"],
  Kia: ["Forte", "K5", "Sportage", "Sorento", "Telluride", "Carnival", "EV6"],
  Lexus: ["ES", "IS", "NX", "RX", "GX"],
  Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-9", "CX-50"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "GLE", "S-Class"],
  Nissan: ["Altima", "Sentra", "Rogue", "Murano", "Pathfinder", "Frontier", "Leaf"],
  Ram: ["1500", "2500", "ProMaster"],
  Subaru: ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  Toyota: ["Corolla", "Camry", "RAV4", "Highlander", "Sienna", "Tacoma", "Tundra", "Prius"],
  Volkswagen: ["Jetta", "Passat", "Tiguan", "Atlas", "ID.4", "Golf"],
  Volvo: ["S60", "XC40", "XC60", "XC90"],
  "Bajaj": ["Pulsar", "Avenger", "Dominar", "Chetak"],
  "Harley-Davidson": ["Iron 883", "Street Glide", "Sportster", "Fat Boy"],
  "Hero": ["Splendor", "HF Deluxe", "Xpulse", "Passion"],
  "Honda Motorcycle": ["CBR", "Rebel", "Gold Wing", "Activa", "Shine"],
  "Kawasaki": ["Ninja", "Z650", "Versys", "Vulcan"],
  "Royal Enfield": ["Classic 350", "Bullet 350", "Himalayan", "Meteor 350", "Interceptor 650"],
  "Suzuki": ["GSX-R", "V-Strom", "Access", "Hayabusa"],
  "TVS": ["Apache", "Jupiter", "Ntorq", "Raider"],
  "Yamaha": ["MT-07", "R3", "FZ", "YZF-R1", "Fascino"],
  Other: ["Other"],
};

export const VEHICLE_MAKE_NAMES = Object.keys(VEHICLE_MAKES);

export const VEHICLE_DOCUMENTS = [
  "Registration available",
  "Insurance valid",
  "Full service history",
  "Accident-free",
  "Clean title",
  "Loan / lien cleared",
] as const;

/** Newest first, back 40 years — the dropdown replaces a free-text year box. */
export function vehicleYears(): number[] {
  const now = new Date().getFullYear() + 1;
  return Array.from({ length: 41 }, (_, index) => now - index);
}

export function isVehicleCard(subcategorySlug?: string | null) {
  return subcategorySlug === VEHICLE_SUBCATEGORY;
}

export function keepKnown(options: readonly string[], values: string[]): string[] {
  return options.filter((option) => values.includes(option));
}

/** "2019 · 42,000 mi · Petrol · First owner" for the card. */
export function vehicleSummary(vehicle: {
  year: number | null;
  mileage: number | null;
  mileageUnit: string | null;
  fuelType: string | null;
  ownership: string | null;
}): string {
  return [
    vehicle.year ? String(vehicle.year) : null,
    vehicle.mileage !== null
      ? `${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit ?? "mi"}`
      : null,
    vehicle.fuelType,
    vehicle.ownership,
  ]
    .filter(Boolean)
    .join(" · ");
}
