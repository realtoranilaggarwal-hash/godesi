/**
 * Where a consumer reports an unsafe grocery, restaurant or sweet-shop
 * problem in each US state. Retail food is regulated locally, so the entry
 * points to the state health (or agriculture) department, which routes to
 * the county where needed.
 */
export type StateFoodContact = {
  code: string;
  name: string;
  agency: string;
  url: string;
  /** Set where restaurants are inspected by a different agency than stores. */
  restaurant?: { agency: string; url: string };
};

export const FOOD_SAFETY_STATES: StateFoodContact[] = [
  {
    code: "AL",
    name: "Alabama",
    agency: "Alabama Department of Public Health",
    url: "https://www.alabamapublichealth.gov/foodsafety/",
  },
  {
    code: "AK",
    name: "Alaska",
    agency: "Alaska DEC Food Safety & Sanitation",
    url: "https://dec.alaska.gov/eh/fss/",
  },
  {
    code: "AZ",
    name: "Arizona",
    agency: "Arizona Department of Health Services",
    url: "https://www.azdhs.gov/preparedness/epidemiology-disease-control/food-safety-environmental-services/index.php",
  },
  {
    code: "AR",
    name: "Arkansas",
    agency: "Arkansas Department of Health",
    url: "https://healthy.arkansas.gov/programs-services/topics/food-protection",
  },
  {
    code: "CA",
    name: "California",
    agency: "California Department of Public Health — Food & Drug Branch",
    url: "https://www.cdph.ca.gov/Programs/CEH/DFDCS/Pages/FDBPrograms/FoodSafetyProgram/FoodComplaints.aspx",
  },
  {
    code: "CO",
    name: "Colorado",
    agency: "Colorado Department of Public Health & Environment",
    url: "https://cdphe.colorado.gov/",
  },
  {
    code: "CT",
    name: "Connecticut",
    agency: "Connecticut Department of Public Health — Food Protection",
    url: "https://portal.ct.gov/dph",
  },
  {
    code: "DE",
    name: "Delaware",
    agency: "Delaware Division of Public Health — Office of Food Protection",
    url: "https://dhss.delaware.gov/dhss/dph/hsp/foodprotection.html",
  },
  {
    code: "DC",
    name: "District of Columbia",
    agency: "DC Health — Food Safety",
    url: "https://dchealth.dc.gov/",
  },
  {
    code: "FL",
    name: "Florida",
    agency:
      "Florida Dept. of Agriculture (FDACS) — grocery & convenience stores",
    url: "https://www.fdacs.gov/Consumer-Resources/File-a-Complaint",
    restaurant: {
      agency: "Florida DBPR — Hotels & Restaurants complaint form",
      url: "https://www.myfloridalicense.com/wl11.asp",
    },
  },
  {
    code: "GA",
    name: "Georgia",
    agency: "Georgia Department of Public Health — Food Service",
    url: "https://dph.georgia.gov/environmental-health/food-service",
  },
  {
    code: "HI",
    name: "Hawaii",
    agency: "Hawaii Department of Health — Food Safety",
    url: "https://health.hawaii.gov/san/",
  },
  {
    code: "ID",
    name: "Idaho",
    agency: "Idaho Department of Health & Welfare — Food Protection",
    url: "https://healthandwelfare.idaho.gov/",
  },
  {
    code: "IL",
    name: "Illinois",
    agency: "Illinois Department of Public Health — Food Safety",
    url: "https://dph.illinois.gov/topics-services/food-safety.html",
  },
  {
    code: "IN",
    name: "Indiana",
    agency: "Indiana Department of Health — Food Protection",
    url: "https://www.in.gov/health/food-protection/",
  },
  {
    code: "IA",
    name: "Iowa",
    agency: "Iowa Department of Inspections, Appeals & Licensing — Food Safety",
    url: "https://dia.iowa.gov/food-consumer-safety",
  },
  {
    code: "KS",
    name: "Kansas",
    agency: "Kansas Department of Agriculture — Food Safety & Lodging",
    url: "https://agriculture.ks.gov/divisions-programs/food-safety-lodging",
  },
  {
    code: "KY",
    name: "Kentucky",
    agency: "Kentucky Cabinet for Health & Family Services — Food Safety",
    url: "https://www.chfs.ky.gov/agencies/dph/dphps/fsb/Pages/default.aspx",
  },
  {
    code: "LA",
    name: "Louisiana",
    agency: "Louisiana Department of Health — Sanitarian Services",
    url: "https://ldh.la.gov/",
  },
  {
    code: "ME",
    name: "Maine",
    agency: "Maine CDC — Health Inspection Program",
    url: "https://www.maine.gov/dhhs/mecdc/environmental-health/el/",
  },
  {
    code: "MD",
    name: "Maryland",
    agency: "Maryland Department of Health — Office of Food Protection",
    url: "https://health.maryland.gov/phpa/OEHFP/OFPCHS/Pages/Home.aspx",
  },
  {
    code: "MA",
    name: "Massachusetts",
    agency: "Massachusetts Department of Public Health — Food Protection",
    url: "https://www.mass.gov/orgs/food-protection-program",
  },
  {
    code: "MI",
    name: "Michigan",
    agency:
      "Michigan Department of Agriculture & Rural Development — Food Safety",
    url: "https://www.michigan.gov/mdard/food-dairy",
  },
  {
    code: "MN",
    name: "Minnesota",
    agency: "Minnesota Department of Health — Food Safety",
    url: "https://www.health.state.mn.us/people/foodsafety/index.html",
  },
  {
    code: "MS",
    name: "Mississippi",
    agency: "Mississippi State Department of Health — Food Protection",
    url: "https://msdh.ms.gov/page/30,0,77.html",
  },
  {
    code: "MO",
    name: "Missouri",
    agency: "Missouri Department of Health & Senior Services — Food Safety",
    url: "https://health.mo.gov/safety/foodsafety/",
  },
  {
    code: "MT",
    name: "Montana",
    agency: "Montana DPHHS — Food & Consumer Safety",
    url: "https://dphhs.mt.gov/",
  },
  {
    code: "NE",
    name: "Nebraska",
    agency: "Nebraska Department of Agriculture — Food Safety",
    url: "https://nda.nebraska.gov/",
  },
  {
    code: "NV",
    name: "Nevada",
    agency:
      "Nevada Division of Public & Behavioral Health — Environmental Health",
    url: "https://dpbh.nv.gov/",
  },
  {
    code: "NH",
    name: "New Hampshire",
    agency: "New Hampshire DHHS — Food Protection",
    url: "https://www.dhhs.nh.gov/programs-services/environmental-health-and-you/food-protection",
  },
  {
    code: "NJ",
    name: "New Jersey",
    agency: "New Jersey Department of Health — Food & Drug Safety",
    url: "https://www.nj.gov/health/ceohs/food-drug-safety/",
  },
  {
    code: "NM",
    name: "New Mexico",
    agency: "New Mexico Environment Department — Food Program",
    url: "https://www.env.nm.gov/",
  },
  {
    code: "NY",
    name: "New York",
    agency: "NY Department of Agriculture & Markets — stores",
    url: "https://agriculture.ny.gov/food-safety/file-complaint",
    restaurant: {
      agency: "NYC 311 (in NYC) or your county health department — restaurants",
      url: "https://portal.311.nyc.gov/",
    },
  },
  {
    code: "NC",
    name: "North Carolina",
    agency: "NCDA&CS Food & Drug Protection — stores",
    url: "https://www.ncagr.gov/divisions/food-drug-protection",
    restaurant: {
      agency: "NC DHHS Environmental Health (county inspectors) — restaurants",
      url: "https://ehs.dph.ncdhhs.gov/",
    },
  },
  {
    code: "ND",
    name: "North Dakota",
    agency: "North Dakota HHS — Food & Lodging",
    url: "https://www.hhs.nd.gov/health/food-and-lodging",
  },
  {
    code: "OH",
    name: "Ohio",
    agency: "Ohio Department of Health — Food Safety",
    url: "https://odh.ohio.gov/know-our-programs/food-safety-program",
  },
  {
    code: "OK",
    name: "Oklahoma",
    agency: "Oklahoma State Department of Health — Consumer Protection",
    url: "https://oklahoma.gov/health.html",
  },
  {
    code: "OR",
    name: "Oregon",
    agency: "Oregon Department of Agriculture — Food Safety",
    url: "https://www.oregon.gov/oda/programs/foodsafety/pages/default.aspx",
  },
  {
    code: "PA",
    name: "Pennsylvania",
    agency: "Pennsylvania Department of Agriculture — Food Safety",
    url: "https://www.pa.gov/agencies/pda/food/food-safety.html",
  },
  {
    code: "RI",
    name: "Rhode Island",
    agency: "Rhode Island Department of Health — Food Protection",
    url: "https://health.ri.gov/food-safety/",
  },
  {
    code: "SC",
    name: "South Carolina",
    agency: "SC Department of Public Health — Food Safety",
    url: "https://dph.sc.gov/",
  },
  {
    code: "SD",
    name: "South Dakota",
    agency: "South Dakota Department of Health — Food Service",
    url: "https://doh.sd.gov/",
  },
  {
    code: "TN",
    name: "Tennessee",
    agency: "Tennessee Department of Health — Food Service Complaints",
    url: "https://www.tn.gov/health/health-program-areas/eh/eh-foodservice.html",
  },
  {
    code: "TX",
    name: "Texas",
    agency: "Texas DSHS — Food Establishments Complaints",
    url: "https://www.dshs.texas.gov/retail-food-establishments",
  },
  {
    code: "UT",
    name: "Utah",
    agency: "Utah Department of Agriculture & Food — Regulatory Services",
    url: "https://ag.utah.gov/businesses/regulatory-services/",
  },
  {
    code: "VT",
    name: "Vermont",
    agency: "Vermont Department of Health — Food & Lodging",
    url: "https://www.healthvermont.gov/environment/food-lodging",
  },
  {
    code: "VA",
    name: "Virginia",
    agency: "VDACS Food Safety — grocery & convenience stores",
    url: "https://www.vdacs.virginia.gov/",
    restaurant: {
      agency: "Virginia Department of Health — restaurants",
      url: "https://www.vdh.virginia.gov/environmental-health/food-safety-in-virginia/",
    },
  },
  {
    code: "WA",
    name: "Washington",
    agency: "Washington State Department of Health — Food Safety",
    url: "https://doh.wa.gov/community-and-environment/food",
  },
  {
    code: "WV",
    name: "West Virginia",
    agency: "West Virginia DHHR — Public Health Sanitation",
    url: "https://oeps.wv.gov/",
  },
  {
    code: "WI",
    name: "Wisconsin",
    agency: "Wisconsin DATCP — Food Safety",
    url: "https://datcp.wi.gov/",
  },
  {
    code: "WY",
    name: "Wyoming",
    agency: "Wyoming Department of Agriculture — Consumer Health Services",
    url: "https://agriculture.wy.gov/",
  },
];
