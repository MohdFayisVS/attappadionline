export interface NewsPost {
  id: string;
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  contentEn: string;
  contentTa?: string;
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
  titleTa?: string;
  titleMl: string;
  date: string;
  time: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  descriptionEn: string;
  descriptionTa?: string;
  descriptionMl: string;
}

export interface DirectoryItem {
  id: string;
  nameEn: string;
  nameTa?: string;
  nameMl: string;
  category: "hospital" | "taxi" | "plumber" | "electrician" | "government" | "schools" | "others_services" | "police" | "fire";
  contact: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
}

export interface EmergencyContact {
  id: string;
  nameEn: string;
  nameTa?: string;
  nameMl: string;
  number: string;
  type: "ambulance" | "police" | "fire" | "hospital" | "forest";
}

export interface OpinionItem {
  id: string;
  authorName: string;
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  contentEn: string;
  contentTa?: string;
  contentMl: string;
  createdAt: string;
  approved: boolean;
}

export interface WeatherSubRegion {
  name: string;
  temp: number;
  conditionEn: string;
  conditionTa?: string;
  conditionMl: string;
}

export interface WeatherData {
  blockName: string;
  conditionEn: string;
  conditionTa?: string;
  conditionMl: string;
  humidity: string;
  breezeEn: string;
  breezeTa?: string;
  breezeMl: string;
  subRegions: WeatherSubRegion[];
}

export interface DestinationItem {
  id: string;
  nameEn: string;
  nameTa?: string;
  nameMl: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  image: string;
  descriptionEn: string;
  descriptionTa?: string;
  descriptionMl: string;
  highlightsEn: string[];
  highlightsTa?: string[];
  highlightsMl: string[];
}

export interface CultureItem {
  id: string;
  type: string; // "culture" | "food"
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  subtitleEn: string;
  subtitleTa?: string;
  subtitleMl: string;
  image: string;
  descEn: string;
  descTa?: string;
  descMl: string;
  elementEn: string;
  elementTa?: string;
  elementMl: string;
}

export interface StayItem {
  id: string;
  nameEn: string;
  nameTa?: string;
  nameMl: string;
  typeEn: string;
  typeTa?: string;
  typeMl: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  image: string;
  priceEn: string;
  priceTa?: string;
  priceMl: string;
  featuresEn: string[];
  featuresTa?: string[];
  featuresMl: string[];
}

export interface TravelogueItem {
  id: string;
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  authorEn: string;
  authorTa?: string;
  authorMl: string;
  date: string;
  snippetEn: string;
  snippetTa?: string;
  snippetMl: string;
  readTimeEn: string;
  readTimeTa?: string;
  readTimeMl: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  descEn: string;
  descTa?: string;
  descMl: string;
}

export interface BusStopTransit {
  time: string;
  typeEn: string;
  typeTa?: string;
  typeMl: string;
  viaCodeEn: string;
  viaCodeTa?: string;
  viaCodeMl: string;
}

export interface BusRouteItem {
  id: string;
  routeEn: string;
  routeTa?: string;
  routeMl: string;
  type: string; // KSRTC, TNSTC, Private
  busTypeEn: string;
  busTypeTa?: string;
  busTypeMl: string;
  runsEn: string;
  runsTa?: string;
  runsMl: string;
  frequencyEn: string;
  frequencyTa?: string;
  frequencyMl: string;
  timingsEn: string;
  timingsTa?: string;
  timingsMl: string;
  list: BusStopTransit[];
  privateBusName?: string;
}

export interface NoticeItem {
  id: string;
  titleEn: string;
  titleTa?: string;
  titleMl: string;
  contentEn: string;
  contentTa?: string;
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
  agencyNameTa?: string;
  agencyNameMl: string;
  areasEn: string;
  areasTa?: string;
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
  titleTa?: string;
  titleMl: string;
  subtitleEn: string;
  subtitleTa?: string;
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
  driverNameTa?: string;
  driverNameMl: string;
  autoNumber: string;
  contact: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  isAvailable: boolean;
  registeredDate: string;
}

export interface LocalShop {
  id: string;
  nameEn: string;
  nameTa?: string;
  nameMl: string;
  category: "grocery" | "bakery" | "medical" | "footwear" | "electronics" | "clothing" | "vegetables" | string;
  contact: string; // WhatsApp number/contact string
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  deliveryEn: string;
  deliveryTa?: string;
  deliveryMl: string;
  itemsEn: string;
  itemsTa?: string;
  itemsMl: string;
}

export interface LostAndFoundItem {
  id: string;
  type: "lost" | "found";
  itemTitleEn: string;
  itemTitleTa?: string;
  itemTitleMl: string;
  descriptionEn: string;
  descriptionTa?: string;
  descriptionMl: string;
  reporterName: string;
  contactNumber: string;
  locationEn: string;
  locationTa?: string;
  locationMl: string;
  dateReported: string;
  status: "active" | "resolved";
}




