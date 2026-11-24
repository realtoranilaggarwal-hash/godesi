/**
 * Gurpurab 2026: publishes the GoDesi.com News story on Guru Nanak Jayanti
 * (with the greeting YouTube Short) and adds US gurdwaras from OpenStreetMap
 * as public worship listings, so /religious?faith=GURUDWARA and the Guru Nanak
 * Jayanti festival page list them. Re-runnable: existing rows are left alone.
 *
 *   DATABASE_URL=... npx tsx scripts/post-gurpurab-2026.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";
import { newsPath } from "../src/lib/newsLinks";

const db = new PrismaClient();
const AUTHOR_ID = "cms24edsq0000t9gk48f24h5h";

const STORY = {
  guid: "godesi:gurpurab-2026",
  title:
    "Guru Nanak Jayanti 2026: Celebrating the Universal Message of Peace, Equality and Humanity",
  summary: "NEW JERSEY, USA – Sikh communities across the United States and around the world are celebrating Guru Nanak Jayanti, also known as Gurpurab, on Tuesday, November 24, 2026, marking the 557th birth anniversary of Guru Nanak Dev Ji, the founder of Sikhism.\n\nBorn in 1469, Guru Nanak Dev Ji shared timeless teachings of equality, honesty, compassion, devotion and service to humanity. His philosophy emphasized that all human beings are equal, regardless of religion, caste, nationality or social background.\n\nHow Sikh Communities Celebrate Gurpurab\n\nGurdwaras across America organize special religious programs and community gatherings to mark this important occasion. The celebrations include:\n\n- Akhand Path: Continuous reading of the Guru Granth Sahib.\n- Nagar Kirtan: Religious processions featuring devotional singing and community participation.\n- Gurbani Kirtan: Singing of sacred hymns and prayers.\n- Langar: Free community meals served to everyone without discrimination.\n- Seva: Selfless service, volunteering and helping those in need.\n\nIn New Jersey, New York, California, Texas, Illinois and other states, Sikh families and community organizations participate in Gurpurab celebrations, sharing their faith, culture and traditions with the wider American community.\n\nThree Timeless Teachings of Guru Nanak Dev Ji\n\nGuru Nanak Dev Ji’s teachings are commonly summarized through three important principles:\n\n- Naam Japna: Remember and meditate on God’s name.\n- Kirat Karni: Earn an honest living through hard work.\n- Vand Chakna: Share with others and help those in need.\n\nThese principles continue to inspire generations to build a society based on kindness, fairness and mutual respect.\n\nA Message That Goes Beyond Religion\n\nGuru Nanak Dev Ji’s message is relevant to people of every faith and background. His teachings encourage communities to overcome divisions, respect one another and work together for a better society.\n\nThe tradition of Langar is a powerful example of this philosophy, bringing people together around a common meal where everyone is treated equally.\n\nGoDesi.com Wishes Everyone a Happy Gurpurab\n\nOn this special occasion, GoDesi.com extends warm wishes to the Sikh community and everyone celebrating Guru Nanak Jayanti.\n\nMay the teachings of Guru Nanak Dev Ji inspire us to live with honesty, generosity, humility and compassion.\n\nOne God. One Humanity. One Message of Peace.\n\nHappy Guru Nanak Jayanti 2026!\n\nFind a gurdwara near you: https://godesi.com/religious?faith=GURUDWARA\n\nPublished by: GoDesi.com News\nWebsite: https://godesi.com/news\n\n#GuruNanakJayanti #Gurpurab2026 #GuruNanakDevJi #SikhCommunity #Sikhism #Langar #NagarKirtan #Seva #NewJersey #IndianAmerican #GoDesiNews #GoDesi",
  source: "GoDesi.com News",
  topic: "faith",
  category: "Religion & faith",
  city: "New Jersey",
  state: "NJ",
  country: "USA",
  happenedAt: new Date("2026-11-24T12:00:00-05:00"),
  publishedAt: new Date("2026-11-24T09:00:00-05:00"),
  sourceType: "Self",
  imageUrl: "/images/categories/sikh-gurdwara.jpg",
  photoUrls: ["/images/categories/sikh-gurdwara.jpg"],
  videoUrl: "https://youtube.com/shorts/obwapquWtSM",
  featured: true,
  status: "PUBLISHED" as const,
};

/** US gurdwaras mapped on OpenStreetMap (amenity=place_of_worship, religion=sikh). */
const GURDWARAS: {
  osmId: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  websiteUrl: string | null;
}[] = [
  {
    "osmId": "way/1197851929",
    "name": "Nishkam Seva Gurdwara Sahib",
    "address": "4950 West Tonopah Drive",
    "city": "Glendale",
    "state": "AZ",
    "latitude": 33.671929,
    "longitude": -112.166642,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/929481525",
    "name": "Arizona Sikh Gurdwara",
    "address": "1129 East Sheridan Street",
    "city": "Phoenix",
    "state": "AZ",
    "latitude": 33.474451,
    "longitude": -112.057244,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/60015333",
    "name": "Sikh Temple",
    "address": "South P Street",
    "city": "Kern County",
    "state": "CA",
    "latitude": 35.333022,
    "longitude": -119.011538,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/667726486",
    "name": "Sikh Gurudwara of Sadh Sangat",
    "address": "Reservoir Drive",
    "city": "Norco",
    "state": "CA",
    "latitude": 33.922679,
    "longitude": -117.546143,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/317463702",
    "name": "Gurudwara San Diego",
    "address": "Oak Knoll Road",
    "city": "Poway",
    "state": "CA",
    "latitude": 32.949529,
    "longitude": -117.065845,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "relation/13829717",
    "name": "Sacramento Sikh Society Gurudwara",
    "address": "Bradshaw Road",
    "city": "Sacramento",
    "state": "CA",
    "latitude": 38.479408,
    "longitude": -121.336373,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/38315002",
    "name": "Sikh Gurdwara San Jose",
    "address": "3636 Chaboya Road",
    "city": "San Jose",
    "state": "CA",
    "latitude": 37.326101,
    "longitude": -121.765084,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/30358759",
    "name": "Gurdwara Sahib",
    "address": "3550 Hillcrest Road",
    "city": "San Pablo",
    "state": "CA",
    "latitude": 37.959759,
    "longitude": -122.316716,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/10932520584",
    "name": "Sikh Center of Orange County",
    "address": "2530 West Warner Avenue",
    "city": "Santa Ana",
    "state": "CA",
    "latitude": 33.71476,
    "longitude": -117.903579,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/2510425249",
    "name": "Sikh Temple",
    "address": "East Hatch Road",
    "city": "Stanislaus County",
    "state": "CA",
    "latitude": 37.609975,
    "longitude": -120.887136,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/358837671",
    "name": "Sikh Temple",
    "address": "East 5th Street",
    "city": "Stockton",
    "state": "CA",
    "latitude": 37.934091,
    "longitude": -121.274946,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/13295443636",
    "name": "Denver Sikh Gurudwara",
    "address": "South Moline Way South",
    "city": "Arapahoe County",
    "state": "CO",
    "latitude": 39.584028,
    "longitude": -104.858455,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/944895249",
    "name": "Gurdwara Nanak Darbar",
    "address": "1610 West Street",
    "city": "Southington",
    "state": "CT",
    "latitude": 41.632219,
    "longitude": -72.900665,
    "phone": "+1 860 621 3015",
    "websiteUrl": "https://ctsikhs.com/"
  },
  {
    "osmId": "node/4988363961",
    "name": "Sikh Gurdwara DC",
    "address": "3801 Massachusetts Avenue Northwest",
    "city": "Washington",
    "state": "DC",
    "latitude": 38.930269,
    "longitude": -77.074715,
    "phone": null,
    "websiteUrl": "https://sikhgurdwaradc.org/"
  },
  {
    "osmId": "way/678331547",
    "name": "Gurdwara Nanaksar Thath Isher Darbar",
    "address": "2480 Nanaksar Lane",
    "city": "Kissimmee",
    "state": "FL",
    "latitude": 28.318709,
    "longitude": -81.446995,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1083628861",
    "name": "Sikh Gurdwara of Tampa Bay",
    "address": "15302 Morris Bridge Road",
    "city": "Thonotosassa",
    "state": "FL",
    "latitude": 28.133472,
    "longitude": -82.288564,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1207304310",
    "name": "Guru Singh Sabha Of Augusta",
    "address": "Evans to Locks Road",
    "city": "Evans",
    "state": "GA",
    "latitude": 33.545823,
    "longitude": -82.100262,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/365589903",
    "name": "SEWA Gurdwara Sahib",
    "address": "10590 Woodstock Road",
    "city": "Roswell",
    "state": "GA",
    "latitude": 34.037988,
    "longitude": -84.371576,
    "phone": "+1 678-819-2990",
    "websiteUrl": "https://www.sewageorgia.org/"
  },
  {
    "osmId": "way/704582931",
    "name": "Gurudwara Sikh Religious Society",
    "address": "2029 West St. Louis Bridge Road",
    "city": "Decatur",
    "state": "IL",
    "latitude": 39.816235,
    "longitude": -88.990185,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/263454005",
    "name": "Sikh Religious Society of Chicago Gurdwara Sahib",
    "address": "1280 West Winnetka Street",
    "city": "Palatine",
    "state": "IL",
    "latitude": 42.131043,
    "longitude": -88.075727,
    "phone": "+1-773-251-4476",
    "websiteUrl": "http://www.srsofchicago.com/"
  },
  {
    "osmId": "way/1070726037",
    "name": "Illinois Sikh Community Center",
    "address": "2131 Creekside Drive",
    "city": "Wheaton",
    "state": "IL",
    "latitude": 41.84804,
    "longitude": -88.138938,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/602191284",
    "name": "Dashmesh Gurudwara",
    "address": "Illinois Road",
    "city": "Fort Wayne",
    "state": "IN",
    "latitude": 41.07549,
    "longitude": -85.333906,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1195146106",
    "name": "Sikh Religious Society of Indiana",
    "address": "10005 Colorado Street",
    "city": "Crown Point",
    "state": "IN",
    "latitude": 41.436518,
    "longitude": -87.29322,
    "phone": "+1 219 793 9446",
    "websiteUrl": "https://www.worldgurudwaras.com/gurudwaras/sikh-religious-society-of-indiana/"
  },
  {
    "osmId": "way/769485121",
    "name": "Sikh Cultural Society of Indiana",
    "address": "12800 Day Road",
    "city": "Mishawaka",
    "state": "IN",
    "latitude": 41.698718,
    "longitude": -86.11564,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/403403492",
    "name": "Sikh Temple of Bluegrass",
    "address": "257 Swigert Avenue",
    "city": "Lexington",
    "state": "KY",
    "latitude": 38.093135,
    "longitude": -84.445748,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/660614085",
    "name": "Westborough Gurdwara Sahib - NESSC",
    "address": "168 Flanders Road",
    "city": "Westborough",
    "state": "MA",
    "latitude": 42.277652,
    "longitude": -71.559521,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/299144917",
    "name": "Baltimore Sikh Society",
    "address": "1731 Rita Road",
    "city": "Dundalk",
    "state": "MD",
    "latitude": 39.27518,
    "longitude": -76.518844,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/299150475",
    "name": "Singh Sabha of Maryland",
    "address": "6701 Brentwood Avenue",
    "city": "Dundalk",
    "state": "MD",
    "latitude": 39.273272,
    "longitude": -76.529553,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/503138581",
    "name": "Gurdwara Washington Sikh Center",
    "address": "7500 Warfield Road",
    "city": "Laytonsville",
    "state": "MD",
    "latitude": 39.194369,
    "longitude": -77.15392,
    "phone": "+1-240-350-1110",
    "websiteUrl": "https://washingtonsikhcenter.org"
  },
  {
    "osmId": "way/1063256893",
    "name": "Singh Sabha Temple",
    "address": "South Canton Center Road",
    "city": "Canton",
    "state": "MI",
    "latitude": 42.281954,
    "longitude": -83.486578,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1296466040",
    "name": "Gurudwara Sahib Khalsa Sikh Temple",
    "address": "7252 Fenton Road",
    "city": "Grand Blanc",
    "state": "MI",
    "latitude": 42.922786,
    "longitude": -83.692017,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/699126250",
    "name": "Sikh Gurdwara",
    "address": "271 West Auburn Road",
    "city": "Rochester Hills",
    "state": "MI",
    "latitude": 42.635464,
    "longitude": -83.137804,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/864520492",
    "name": "Gurdwara Sahib",
    "address": "33340 Dequindre Road",
    "city": "Sterling Heights",
    "state": "MI",
    "latitude": 42.537402,
    "longitude": -83.084862,
    "phone": "+1-248-547-0927",
    "websiteUrl": "https://michigangurdwara.com/"
  },
  {
    "osmId": "way/283502323",
    "name": "Sikh Society of Minnesota",
    "address": "9000 West Bloomington Freeway",
    "city": "Bloomington",
    "state": "MN",
    "latitude": 44.840131,
    "longitude": -93.299469,
    "phone": "+1-952-888-2705",
    "websiteUrl": "https://www.mnsikhs.com"
  },
  {
    "osmId": "way/1085388534",
    "name": "Garden State Sikh Association Gurudwara",
    "address": "Washington Valley Road",
    "city": "Bridgewater",
    "state": "NJ",
    "latitude": 40.645159,
    "longitude": -74.625049,
    "phone": null,
    "websiteUrl": "https://sites.google.com/view/gssabw/home"
  },
  {
    "osmId": "way/442307770",
    "name": "Glen Rock Gurudwara",
    "address": "PSE&G Path",
    "city": "Glen Rock",
    "state": "NJ",
    "latitude": 40.964491,
    "longitude": -74.111503,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/605362560",
    "name": "Sikh Gurdwara of Pine Hill",
    "address": "New Street",
    "city": "Pine Hill",
    "state": "NJ",
    "latitude": 39.804009,
    "longitude": -75.018954,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1264446449",
    "name": "Gurdwara Baba Deep Singh",
    "address": "West Lone Mountain Road",
    "city": "Las Vegas",
    "state": "NV",
    "latitude": 36.246376,
    "longitude": -115.233101,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/772461339",
    "name": "Gurdwara Mata Sahib Kaur",
    "address": "100 Lattingtown Road",
    "city": "Glen Cove",
    "state": "NY",
    "latitude": 40.889637,
    "longitude": -73.620904,
    "phone": "+1 516-609-3333",
    "websiteUrl": null
  },
  {
    "osmId": "way/701414056",
    "name": "Gurudwara Sahib Hudson Valley Sikh Society",
    "address": "84 Genung Street",
    "city": "Middletown",
    "state": "NY",
    "latitude": 41.436392,
    "longitude": -74.41654,
    "phone": "+1-845-343-3080",
    "websiteUrl": null
  },
  {
    "osmId": "way/1359943644",
    "name": "Niagara Frontier Sikh Society",
    "address": "9550 Clarence Center Road",
    "city": "Clarence Center",
    "state": "NY",
    "latitude": 43.010555,
    "longitude": -78.633776,
    "phone": "+1-716-741-0077",
    "websiteUrl": null
  },
  {
    "osmId": "node/357646398",
    "name": "Gurudwara Mid Hudson Sikh Temple",
    "address": "Ketchamtown Road",
    "city": "Hughsonville",
    "state": "NY",
    "latitude": 41.561111,
    "longitude": -73.911389,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/282260211",
    "name": "Gurdwara Sikh Temple",
    "address": "117-03 97th Avenue",
    "city": "Queens",
    "state": "NY",
    "latitude": 40.691109,
    "longitude": -73.828017,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/282322005",
    "name": "Gurudwara Guru Bhagati Ghar",
    "address": "107-50 134th Street",
    "city": "Queens",
    "state": "NY",
    "latitude": 40.686479,
    "longitude": -73.810394,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/491209761",
    "name": "Guru Nanak Darbar Sikh Temple",
    "address": "Saint David's Lane",
    "city": "Niskayuna",
    "state": "NY",
    "latitude": 42.794303,
    "longitude": -73.88681,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/557670398",
    "name": "Gurudwara Sahib",
    "address": "Canfield Road",
    "city": "Youngstown",
    "state": "OH",
    "latitude": 41.065484,
    "longitude": -80.687791,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/918862089",
    "name": "Sikh Gurdwara of Oklahoma",
    "address": "4525 Northwest 16th Street",
    "city": "Oklahoma City",
    "state": "OK",
    "latitude": 35.4873,
    "longitude": -97.602613,
    "phone": "+1 405 949 2638",
    "websiteUrl": "http://okcgurdwara.com/"
  },
  {
    "osmId": "way/451144601",
    "name": "Guru Ram Das Gurdwara",
    "address": "3635 Hilyard Street",
    "city": "Eugene",
    "state": "OR",
    "latitude": 44.016627,
    "longitude": -123.081644,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1242298494",
    "name": "Gurudwara Shri Guru Nanak Dev Ji Sikh Temple",
    "address": "4384 Carnes Road",
    "city": "Roseburg",
    "state": "OR",
    "latitude": 43.15088,
    "longitude": -123.382225,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/10314376515",
    "name": "Dasmesh Darbar Sikh Temple",
    "address": "860 Oakhill Avenue Southeast",
    "city": "Salem",
    "state": "OR",
    "latitude": 44.899582,
    "longitude": -123.037087,
    "phone": "+1-503-391-7031",
    "websiteUrl": null
  },
  {
    "osmId": "way/948275571",
    "name": "Philadelphia Sikh Society",
    "address": "6706 Garden Court",
    "city": "Upper Darby",
    "state": "PA",
    "latitude": 39.962965,
    "longitude": -75.255473,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "node/9969123133",
    "name": "Guru Nanak Sikh Society",
    "address": "310 South 69th Street",
    "city": "Upper Darby",
    "state": "PA",
    "latitude": 39.954819,
    "longitude": -75.258594,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/381830989",
    "name": "Gurdwara Guru Nanak Darbar",
    "address": "23700 Nameless Road",
    "city": "Jonestown",
    "state": "TX",
    "latitude": 30.511834,
    "longitude": -97.914428,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/327275153",
    "name": "Sikh Center of San Antonio",
    "address": "6011 Hollyhock Road",
    "city": "San Antonio",
    "state": "TX",
    "latitude": 29.536027,
    "longitude": -98.604648,
    "phone": null,
    "websiteUrl": "http://www.sikhcenter.us/"
  },
  {
    "osmId": "way/962034679",
    "name": "Sikh Temple of Utah",
    "address": "4897 Redwood Road",
    "city": "Taylorsville",
    "state": "UT",
    "latitude": 40.662773,
    "longitude": -111.938017,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1046365586",
    "name": "Sikh Center of Virginia",
    "address": "8015 Buckhall Road",
    "city": "Manassas",
    "state": "VA",
    "latitude": 38.732141,
    "longitude": -77.446831,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/654432366",
    "name": "Gurudwara Sacha Marag",
    "address": "12431 Southeast 286th Place",
    "city": "Auburn",
    "state": "WA",
    "latitude": 47.344942,
    "longitude": -122.174941,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/1006885004",
    "name": "Singh Sabha Gurdwara Bellingham",
    "address": "591 Telegraph Road",
    "city": "Bellingham",
    "state": "WA",
    "latitude": 48.784815,
    "longitude": -122.477325,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/410977656",
    "name": "Gurdwara Sri Guru Tegh Bahadur Sahib Ji",
    "address": "24440 132nd Avenue Southeast",
    "city": "Kent",
    "state": "WA",
    "latitude": 47.382878,
    "longitude": -122.164784,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/577022600",
    "name": "Guru Nanak Gursikh Gurudwara",
    "address": "176 East Pole Road",
    "city": "Lynden",
    "state": "WA",
    "latitude": 48.893389,
    "longitude": -122.481778,
    "phone": "+1-360-398-1184",
    "websiteUrl": null
  },
  {
    "osmId": "way/839963158",
    "name": "Guru Nanak Sikh Temple of Marysville",
    "address": "4919 61st Street Northeast",
    "city": "Marysville",
    "state": "WA",
    "latitude": 48.051262,
    "longitude": -122.164869,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/495040462",
    "name": "Gurudwara Singh Sabha of Washington",
    "address": "Talbot Road South",
    "city": "Renton",
    "state": "WA",
    "latitude": 47.432766,
    "longitude": -122.211903,
    "phone": null,
    "websiteUrl": "http://www.singhsabhaseattle.com"
  },
  {
    "osmId": "way/636617372",
    "name": "Gurdwara Sahib",
    "address": "Northeast Saint Johns Road",
    "city": "Vancouver",
    "state": "WA",
    "latitude": 45.655867,
    "longitude": -122.636655,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/758447026",
    "name": "Sikh Religious Society of Wisconsin",
    "address": "3675 North Calhoun Road",
    "city": "Brookfield",
    "state": "WI",
    "latitude": 43.085495,
    "longitude": -88.126598,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/560358778",
    "name": "Sikh Temple of Fox Valley",
    "address": "1304 Midway Road",
    "city": "Menasha",
    "state": "WI",
    "latitude": 44.23056,
    "longitude": -88.420694,
    "phone": "+1-920-209-7786",
    "websiteUrl": null
  },
  {
    "osmId": "way/245519810",
    "name": "Gurudwara Shaibji",
    "address": "Century Avenue",
    "city": "Middleton",
    "state": "WI",
    "latitude": 43.10884,
    "longitude": -89.500417,
    "phone": null,
    "websiteUrl": null
  },
  {
    "osmId": "way/664280068",
    "name": "Sikh Temple of Wisconsin",
    "address": "7512 South Howell Avenue",
    "city": "Oak Creek",
    "state": "WI",
    "latitude": 42.908006,
    "longitude": -87.908519,
    "phone": null,
    "websiteUrl": null
  }
];

async function main() {
  const author = await db.user.findUnique({
    where: { id: AUTHOR_ID },
    select: { id: true },
  });
  if (!author) throw new Error("GoDesi editor account not found");

  const existing = await db.newsItem.findUnique({ where: { guid: STORY.guid } });
  const story =
    existing ??
    (await db.newsItem.create({
      data: { ...STORY, link: "", submittedById: author.id, declaredAt: new Date() },
    }));
  if (!story.link) {
    await db.newsItem.update({
      where: { id: story.id },
      data: { link: newsPath(story) },
    });
  }
  console.log(existing ? "story already there:" : "story published:", newsPath(story));

  let added = 0;
  for (const place of GURDWARAS) {
    if (await db.worshipPlace.findUnique({ where: { osmId: place.osmId } })) continue;
    const base = slugify(`${place.name} ${place.city} ${place.state}`);
    let slug = base;
    for (let n = 2; await db.worshipPlace.findUnique({ where: { slug } }); n++) {
      slug = `${base}-${n}`;
    }
    await db.worshipPlace.create({
      data: {
        ...place,
        slug,
        faith: "GURUDWARA",
        country: "USA",
        source: "osm",
        status: "APPROVED",
        description: `Gurdwara Sahib in ${place.city}, ${place.state}.`,
      },
    });
    added++;
  }
  console.log(`gurdwaras added: ${added} of ${GURDWARAS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
