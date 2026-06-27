export interface NewsPost {
  id: string;
  titleEn: string;
  titleMl: string;
  contentEn: string;
  contentMl: string;
  category: "breaking" | "latest" | "updates";
  regions: string[];
  image: string;
  publishedAt: string;
  views: number;
  isSlide?: boolean;
  isCard?: boolean;
}

export interface EventItem {
  id: string;
  titleEn: string;
  titleMl: string;
  date: string;
  time: string;
  locationEn: string;
  locationMl: string;
  descriptionEn: string;
  descriptionMl: string;
}

export interface DirectoryItem {
  id: string;
  nameEn: string;
  nameMl: string;
  category: "hospital" | "taxi" | "plumber" | "electrician" | "government" | "schools" | "others_services" | "police" | "fire";
  contact: string;
  locationEn: string;
  locationMl: string;
}

export interface EmergencyContact {
  id: string;
  nameEn: string;
  nameMl: string;
  number: string;
  type: "ambulance" | "police" | "fire" | "hospital" | "forest";
}

export interface OpinionItem {
  id: string;
  authorName: string;
  titleEn: string;
  titleMl: string;
  contentEn: string;
  contentMl: string;
  createdAt: string;
  approved: boolean;
}

export interface WeatherSubRegion {
  name: string;
  temp: number;
  conditionEn: string;
  conditionMl: string;
}

export interface WeatherData {
  blockName: string;
  conditionEn: string;
  conditionMl: string;
  humidity: string;
  breezeEn: string;
  breezeMl: string;
  subRegions: WeatherSubRegion[];
}

export interface DestinationItem {
  id: string;
  nameEn: string;
  nameMl: string;
  locationEn: string;
  locationMl: string;
  image: string;
  descriptionEn: string;
  descriptionMl: string;
  highlightsEn: string[];
  highlightsMl: string[];
}

export interface CultureItem {
  id: string;
  type: string; // "culture" | "food"
  titleEn: string;
  titleMl: string;
  subtitleEn: string;
  subtitleMl: string;
  image: string;
  descEn: string;
  descMl: string;
  elementEn: string;
  elementMl: string;
}

export interface StayItem {
  id: string;
  nameEn: string;
  nameMl: string;
  typeEn: string;
  typeMl: string;
  locationEn: string;
  locationMl: string;
  image: string;
  priceEn: string;
  priceMl: string;
  featuresEn: string[];
  featuresMl: string[];
}

export interface TravelogueItem {
  id: string;
  titleEn: string;
  titleMl: string;
  authorEn: string;
  authorMl: string;
  date: string;
  snippetEn: string;
  snippetMl: string;
  readTimeEn: string;
  readTimeMl: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  titleEn: string;
  titleMl: string;
  descEn: string;
  descMl: string;
}

export interface BusStopTransit {
  time: string;
  typeEn: string;
  typeMl: string;
  viaCodeEn: string;
  viaCodeMl: string;
}

export interface BusRouteItem {
  id: string;
  routeEn: string;
  routeMl: string;
  type: string; // KSRTC, TNSTC, Private
  busTypeEn: string;
  busTypeMl: string;
  runsEn: string;
  runsMl: string;
  frequencyEn: string;
  frequencyMl: string;
  timingsEn: string;
  timingsMl: string;
  list: BusStopTransit[];
  privateBusName?: string;
}

export interface NoticeItem {
  id: string;
  titleEn: string;
  titleMl: string;
  contentEn: string;
  contentMl: string;
  type: "caution" | "notice" | "attention" | string;
  severity: "high" | "medium" | "low" | string;
  date: string;
  active: boolean;
  image?: string;
}

export interface LpgDelivery {
  id: string;
  agencyNameEn: string;
  agencyNameMl: string;
  areasEn: string;
  areasMl: string;
  date: string; 
  statusEn: string; // e.g. "Delivering Today", "Upcoming", "Rescheduled", "Completed"
  statusMl: string;
  contact: string;
  notesEn?: string;
  notesMl?: string;
}

export interface AdBlock {
  titleEn: string;
  titleMl: string;
  subtitleEn: string;
  subtitleMl: string;
  contact: string;
  actionType: "phone" | "website" | "whatsapp" | "share";
  externalUrl?: string;
  image?: string;
}

export interface AdConfig {
  leftAd: AdBlock;
  rightAd: AdBlock;
}

export interface AutoTaxi {
  id: string;
  driverNameEn: string;
  driverNameMl: string;
  autoNumber: string;
  contact: string;
  locationEn: string;
  locationMl: string;
  isAvailable: boolean;
  registeredDate: string;
}

export interface LocalShop {
  id: string;
  nameEn: string;
  nameMl: string;
  category: "grocery" | "bakery" | "medical" | "footwear" | "electronics" | "clothing" | "vegetables" | string;
  contact: string; // WhatsApp number/contact string
  locationEn: string;
  locationMl: string;
  deliveryEn: string;
  deliveryMl: string;
  itemsEn: string;
  itemsMl: string;
}




