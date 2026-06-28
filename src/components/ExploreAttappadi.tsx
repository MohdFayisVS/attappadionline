import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Compass, UtensilsCrossed, Hotel, BookOpen, Image as ImageIcon, X, ChevronLeft, ChevronRight, Share2, Volume2, Bus, Clock, Search, Info, Sliders, Plus, Trash, Link, RotateCcw, Copy, Check, Move } from "lucide-react";
import { DestinationItem, CultureItem, StayItem, TravelogueItem, PhotoItem, BusRouteItem } from "../types";

interface ExploreAttappadiProps {
  lang: "en" | "ml";
  initialTab?: "destinations" | "food" | "stays" | "travelogues" | "photos" | "culture" | "busTimings";
  isAdmin?: boolean;
  hideTabsSelection?: boolean;
}

// Default backup data lists
const defaultDestinations: DestinationItem[] = [
  {
    id: "dest_1",
    nameEn: "Silent Valley National Park",
    nameMl: "സൈലന്റ് വാലി ദേശീയോദ്യാനം",
    locationEn: "Mukkali Ranger Station",
    locationMl: "മുക്കാലി ഫോറസ്റ്റ് റേഞ്ച് ഓഫീസ്",
    image: "https://images.unsplash.com/photo-1549221194-4fa7a41413f4?w=800&auto=format&fit=crop&q=80",
    descriptionEn: "One of the last undisturbed rain forests in India. Protected under the Nilgiri Biosphere Reserve, it is famous for its evergreen canopy, pristine wild rivers, and rare wildlife like the Lion-tailed Macaque.",
    descriptionMl: "ഇന്ത്യയിലെ അവശേഷിക്കുന്ന ഏക കന്യകാവനങ്ങളിലൊന്ന്. നീലഗിരി ബയോസ്ഫിയർ റിസർവിന്റെ ഭാഗമായ ഇവിടെ നിത്യഹരിത വനനിരകളും, തെളിഞ്ഞ വന്യ നദികളും, സിംഹവാലൻ കുരങ്ങുകൾ ഉൾപ്പെടെയുള്ള അപൂർവ വന്യജീവി സമ്പത്തുമുണ്ട്.",
    highlightsEn: ["Jeep Safari from Mukkali", "Sylvan Trekking Trails", "Beautiful Watchtower views"],
    highlightsMl: ["മുക്കാലിയിൽ നിന്നുള്ള ജീപ്പ് സഫാരി", "പ്രകൃതിദത്ത ട്രെക്കിങ് പാതകൾ", "വാച്ച് ടവർ വ്യൂ പോയിന്റുകൾ"]
  },
  {
    id: "dest_2",
    nameEn: "Malleswara Peak",
    nameMl: "മല്ലേശ്വരൻ മുടി",
    locationEn: "Near Agali",
    locationMl: "അഗളിക്ക് സമീപം",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
    descriptionEn: "The tallest vertical mountain peak in Attappadi, revered as a deity (Lord Shiva) by the native tribal groups. Swathed in majestic clouds, it is the center of the massive annual Shivratri celebrations.",
    descriptionMl: "അട്ടപ്പാടിയിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി. മല്ലേശ്വരൻ മുടിയെ ഇവിടുത്തെ ആദിവാസി ജനവിഭാഗങ്ങൾ പരമശിവനായി പൂജിച്ച് ആരാധിക്കുന്നു. മനോഹരമായ മഞ്ഞുമൂടിയ മലനിരകളും പ്രശസ്തമായ ശിവരാത്രി കൊടിയേറ്റും ഇവിടുത്തെ പ്രത്യേകതയാണ്.",
    highlightsEn: ["Cultural Pilgrimage", "Spiritual Trekking", "Mist-shrouded viewpoints"],
    highlightsMl: ["ആത്മീയ തീർത്ഥാടനം", "വിശുദ്ധ ട്രെക്കിങ് പാത", "മഞ്ഞുമൂടിയ വ്യൂ പോയിന്റുകൾ"]
  },
  {
    id: "dest_3",
    nameEn: "Siruvani River & Dam Reservoir",
    nameMl: "ശിരുവാണി പുഴയും ഡാമും",
    locationEn: "Singampatti Catchments",
    locationMl: "സിംഗംപെട്ടി വൃഷ്ടിപ്രദേശം",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    descriptionEn: "Renowned globally for generating water of unmatched sweetness. The Siruvani reservoir is surrounded by dense forests, deep gorges, and serves as a vital cross-border water network between Kerala and Tamil Nadu.",
    descriptionMl: "ലോകത്തിലെ ഏറ്റവും സ്വാദുള്ള കുടിവെള്ള സ്രോതസ്സുകളിലൊന്നായി അറിയപ്പെടുന്നു. ശിരുവാണി റിസർവോയർ നിബിഡ വനങ്ങളാലും മലയിടുക്കുകളാലും ചുറ്റപ്പെട്ടിരിക്കുന്നു. കേരളത്തിന്റെയും തമിഴ്‌നാടിന്റെയും അതിർത്തി പങ്കിടുന്ന ജലപാതയാണിത്.",
    highlightsEn: ["Scenic Waterfalls", "Silent Photography Spots", "Pristine nature sounds"],
    highlightsMl: ["മനോഹരമായ വെള്ളച്ചാട്ടങ്ങൾ", "ഫോട്ടോഗ്രാഫി സ്പോട്ടുകൾ", "വന്യമായ ശബ്‍ദാനുഭവം"]
  },
  {
    id: "dest_4",
    nameEn: "Bhavani River & Suspension Bridge",
    nameMl: "ഭവാനി പുഴയും തൂക്കുപാലവും",
    locationEn: "Thavalam Nodal",
    locationMl: "താവളം ജംഗ്ഷൻ",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80",
    descriptionEn: "A major perennial river flowing eastward into neighboring Tamil Nadu. The hanging suspension bridge at Thavalam is a popular local engineering marvel offering panoramic snapshots over the flowing currents.",
    descriptionMl: "കിഴക്കോട്ട് ഒഴുകുന്ന അപൂർവ്വം നദികളിലൊന്ന്. താവളത്തിലുള്ള മനോഹരമായ തൂക്കുപാലം പ്രദേശവാസികൾക്കും സഞ്ചാരികൾക്കും ആകർഷകമായ കാഴ്ചാനുഭവവും ഭവാനിപ്പുഴയുടെ വിശാലമായ ദൃശ്യവും സമ്മാനിക്കുന്നു.",
    highlightsEn: ["Riverbanks Relaxation", "Traditional Suspension Bridge", "Bird Watching spots"],
    highlightsMl: ["പുഴയോര വിശ്രമം", "തൂക്കുപാലത്തിലൂടെയുള്ള നടത്തം", "പക്ഷി നിരീക്ഷണം"]
  }
];

const defaultCultures: CultureItem[] = [
  {
    id: "cult_1",
    type: "culture",
    titleEn: "Tribal Dances & Instrumental Arts",
    titleMl: "ഗോത്രവർഗ്ഗ നൃത്തങ്ങളും സംഗീതവും",
    subtitleEn: "Irula, Muduga, & Kurumba Traditions",
    subtitleMl: "ഇരുള, മുഡുക, കുറുമ്പ പാരമ്പര്യം",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80",
    descEn: "Attappadi's identity beats to the rhythm of traditional tribal folk music and dances. The 'Kakka Karumban' and 'Elelakkaradi' represent spirited dance rituals depicting wild creatures, harvest cycles, and ancestral spirits performed around glowing community campfires.",
    descMl: "പരമ്പരാഗത ഗോത്ര സംഗീതത്തിന്റെയും നൃത്ത രൂപങ്ങളുടെയും താളങ്ങളിലാണ് അട്ടപ്പാടിയുടെ ആത്മാവ് പടരുന്നത്. കാട്ടുമൃഗങ്ങളുടെ ചലനങ്ങളും വിതക്കൊയ്ത്തുകളും വർണ്ണിക്കുന്ന 'കാക്ക കറുമ്പൻ', 'ഏലേലക്കരടി' നൃത്തങ്ങൾ ഗ്രാമീണ കൂട്ടായ്മകളുടെ പ്രതീകങ്ങളാണ്.",
    elementEn: "Key Instruments: Kozhal (pipe), Thavi, & Para drum beats.",
    elementMl: "പ്രധാന വാദ്യങ്ങൾ: കുഴൽ, തവി, തകിൽ, പറ മേളങ്ങൾ."
  },
  {
    id: "cult_2",
    type: "food",
    titleEn: "Millet-centric Gastronomy & Forest Teas",
    titleMl: "പാരമ്പര്യ ധാന്യ വിഭവങ്ങളും കാട്ടുതേനും",
    subtitleEn: "Vanya Ragi, Chama, & Bamboo Rice",
    subtitleMl: "റാഗി, ചാമ, മുളയരി കഞ്ഞി",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    descEn: "Nutrition in the valley traces back to ancient millets. Standard meals center around nourishing Ragi Porridge (റാഗി കുറുക്ക്), Chama rice, and steaming forest tea mixed with immune-boosting country roots. Native bamboo rice payasam made during winter seasons is an absolute sweet delicacy.",
    descMl: "പ്രകൃതിയോടിണങ്ങിയ പരമ്പരാഗത തനിമയാണ് അട്ടപ്പാടിയിലെ ഭക്ഷണരീതിക്ക്. പോഷകഗുണമേറിയ റാഗി കുറുക്ക്, ചാമച്ചോറ്, ഔഷധവേരുകൾ ചേർത്ത കാട്ടുചായ എന്നിവ ഊരുകളിലെ നിത്യഭക്ഷണമാണ്. കൂടാതെ മുളയരി പായസം പ്രത്യേക ഉത്സവങ്ങളിലെ മധുരവിഭവമാണ്.",
    elementEn: "Try: Organic Wild Honey & Bamboo Seed Payasam.",
    elementMl: "രുചിച്ചുനോക്കൂ: ശുദ്ധമായ കാട്ടുതേൻ, മുളയരി പായസം."
  }
];

const defaultStays: StayItem[] = [
  {
    id: "stay_1",
    nameEn: "Silent Valley Eco Forest Lodge",
    nameMl: "സൈലന്റ് വാലി ഇക്കോ ലോഗ് ഹൗസ്",
    typeEn: "Govt-owned Eco Haven",
    typeMl: "സർക്കാർ ഉടമസ്ഥതയിലുള്ള വനം കുടിലുകൾ",
    locationEn: "Mukkali Nodal",
    locationMl: "മുക്കാലി വില്ലേജ്",
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&auto=format&fit=crop&q=80",
    priceEn: "₹2,500 - ₹4,500 per night",
    priceMl: "പ്രതിദിനം ₹2,500 - ₹4,500",
    featuresEn: ["Owned by Forest Department", "Authentic native guides", "Organic food mess"],
    featuresMl: ["വനം വകുപ്പ് നിയന്ത്രണത്തിൽ", "തദ്ദേശീയരായ ഗൈഡുകൾ", "നാടൻ ഭക്ഷണശാല"]
  },
  {
    id: "stay_2",
    nameEn: "Bhavani Riverside Nature Estate",
    nameMl: "ഭവാനി റിവർസൈഡ് നേച്ചർ എസ്റ്റേറ്റ്",
    typeEn: "Premium Private Lodge",
    typeMl: "പ്രീമിയം പ്രൈവറ്റ് റിസോർട്ട്",
    locationEn: "Agali Hills",
    locationMl: "അഗളി കുന്നുകൾ",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80",
    priceEn: "₹4,000 - ₹7,000 per night",
    priceMl: "പ്രതിദിനം ₹4,000 - ₹7,000",
    featuresEn: ["Panoramic river frontage", "Campfire under stars", "Jeep trekking options"],
    featuresMl: ["ഭവാനിപ്പുഴയുടെ സുന്ദരമായ കാഴ്ച", "നിവേദ്യമായ ക്യാമ്പ്ഫയർ", "ഓഫ്-റോഡ് ജീപ്പ് സവാരി"]
  },
  {
    id: "stay_3",
    nameEn: "Agali Valley HomeStays",
    nameMl: "അഗളി വാലി ഹോംസ്റ്റേകൾ",
    typeEn: "Community Farm Stay",
    typeMl: "തദ്ദേശീയ കർഷക ഭവനങ്ങൾ",
    locationEn: "Thavalam-Agali corridor",
    locationMl: "താവളം-അഗളി റോഡ്",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=80",
    priceEn: "₹1,200 - ₹2,000 per night",
    priceMl: "പ്രതിദിനം ₹1,200 - ₹2,000",
    featuresEn: ["Hosted by farming families", "Spice garden walking tour", "Home-cooked traditional dishes"],
    featuresMl: ["നാടൻ കർഷക കുടുംബങ്ങളോടൊപ്പം", "സുഗന്ധവ്യഞ്ജന തോട്ട സന്ദർശനം", "രുചികരമായ നാടൻ കഞ്ഞി വിഭവങ്ങൾ"]
  }
];

const defaultTravelogues: TravelogueItem[] = [
  {
    id: "trav_1",
    titleEn: "Monsoon Magic: Walking Through Silent Valley Catchments",
    titleMl: "വർഷകാലത്തെ പ്രകൃതി വസന്തം: സൈലന്റ് വാലിയിലൂടെ ഒരു കാൽനട യാത്ര",
    authorEn: "Fayis Mohammed, Travel Columnist",
    authorMl: "ഫായിസ് മുഹമ്മദ്, യാത്രാവിവരണ ചരിത്രകാരൻ",
    date: "June 2026",
    snippetEn: "Heavy mist envelops the towering teak canopies. Droplets fall from ancient moss-laden trees as the wild Siruvani streams hum a distant lullaby. Walking on the damp orange leaf litter of Mukkali ranger trails resets your perspective completely...",
    snippetMl: "കനത്ത കോടമഞ്ഞ് ഉയരമുള്ള നിത്യഹരിത മരങ്ങളെ തഴുകിപ്പോകുന്നു. വൃക്ഷത്തലപ്പുകളിൽ നിന്ന് വീഴുന്ന ഓരോ മഴത്തുള്ളിയും ശിരുവാണിപ്പുഴയുടെ ഹൃദയതാളങ്ങൾക്ക് മാറ്റുകൂട്ടുന്നു. മുക്കാലിയിലെ ഈ അടിപ്പാതയിലൂടെയുള്ള നടത്തം പ്രകൃതിയുടെ മറ്റൊരു ലോകത്തേക്ക് നമ്മെ കൊണ്ടുപോകും...",
    readTimeEn: "5 min read",
    readTimeMl: "5 മിനുട്ട് വായന"
  },
  {
    id: "trav_2",
    titleEn: "Reverence & Height: Gaining Perspective at the base of deity peak Malleswara",
    titleMl: "കരുത്തിന്റെ പ്രതീകം: മല്ലേശ്വരൻ മുടിയുടെ താഴ്വാരങ്ങളിലൂടെയുള്ള അനുഭവം",
    authorEn: "Adv. Rajesh K., Agali",
    authorMl: "അഡ്വ. രാജേഷ് കെ., അഗളി",
    date: "May 2026",
    snippetEn: "Every tribal community member elders look up to Malleswaram peak with sheer silence and respect. Trekking to the perimeter during the Shivratri night when giant beacons are lit atop is an otherworldly experience where drum beats echo along valleys...",
    snippetMl: "അട്ടപ്പാടിയിലെ ഓരോ ജനവിഭാഗത്തിനും മല്ലേശ്വരൻ മുടി കേവലമൊരു പർവ്വതമല്ല; വലിയൊരു വിശ്വാസമാണ്. ശിവരാത്രി ദിനത്തിൽ മലമുകളിൽ മല്ലേശ്വരൻ ദീപം പ്രകാശിക്കുമ്പോൾ അതിർത്തികളിൽ മുഴങ്ങുന്ന തുടിമേളങ്ങളുടെ ശബ്ദം നാടിൻ്റെ ഐക്യത്തിൻ്റെ പ്രതീകമാണ്...",
    readTimeEn: "4 min read",
    readTimeMl: "4 മിനുട്ട് വായന"
  }
];

const defaultPhotos: PhotoItem[] = [
  {
    id: "photo_1",
    url: "https://images.unsplash.com/photo-1549221194-4fa7a41413f4?w=1000&auto=format&fit=crop",
    titleEn: "Misty Evergreen Canopies of Silent Valley",
    titleMl: "കോടമഞ്ഞിൽ മൂടിയ സൈലന്റ് വാലി നിബിഡവനങ്ങൾ",
    descEn: "A pristine early morning viewpoint inside the deep core rainforest.",
    descMl: "പ്രഭാതത്തിൽ സൈലന്റ് വാലി ദേശീയോദ്യാനത്തിനുള്ളിൽ നിന്നുള്ള വന്യമായ ദൃശ്യം."
  },
  {
    id: "photo_2",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop",
    titleEn: "Malleswara Peak Shrouded in Silken Clouds",
    titleMl: "മല്ലേശ്വരൻ മുടിയെ തഴുകുന്ന മേഘജാലം",
    descEn: "Revered vertical peak holding sacred importance for native tribal hamlets.",
    descMl: "ആദിവാസി ഊരുകൾ പവിത്രമായി കാണുന്ന അട്ടപ്പാടിയുടെ കാവൽ ദൈവം."
  },
  {
    id: "photo_3",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop",
    titleEn: "Primal Siruvani Streams Carrying Sweet Water",
    titleMl: "മലനിരകളിൽ നിന്നൊഴുകിയെത്തുന്ന ശിരുവാണി പുഴ",
    descEn: "Purest, famously sweet water reservoir streams flowing through deep blocks.",
    descMl: "വിഖ്യാതമായ മധുരമേറിയ ഈ കുടിവെള്ള നദി കാടുകളുടെ ഹൃദയം തൊട്ടൊഴുകുന്നു."
  },
  {
    id: "photo_4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&auto=format&fit=crop",
    titleEn: "Ancient Bamboo Thickets near Bhavani Banks",
    titleMl: "ഭവാനിപ്പുഴയോരത്തെ പുരാതന മുളങ്കാടുകൾ",
    descEn: "Home to beautiful indigenous birds and natural wilderness vibes.",
    descMl: "അപൂർവ പക്ഷികൾക്ക് താവളമൊരുക്കുന്ന താവളത്തിലെ നിബിഡമായ ഈ മുളങ്കാടുകൾ."
  },
  {
    id: "photo_5",
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop",
    titleEn: "Ragi and Millet Farmlands of Pudur Grama Panchayat",
    titleMl: "പുതൂരിലെ മനോഹരമായ പരമ്പരാഗത റാഗി കൃഷിയിടം",
    descEn: "Ensuring deep nutrition and historic self-reliance across block boundaries.",
    descMl: "അട്ടപ്പാടിക്ക് തനതായ ആരോഗ്യസുരക്ഷ പകരുന്ന പുരാതന ധാന്യ വിള നിലങ്ങൾ."
  },
  {
    id: "photo_6",
    url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1000&auto=format&fit=crop",
    titleEn: "Rustic Wooden Walkway in Mukkali Buffer Zone",
    titleMl: "മുക്കാലി ബഫർ സോണിലെ പ്രകൃതിദത്ത നടപ്പാത",
    descEn: "Step closer to untouched, moss-covered wilderness of Silent Valley.",
    descMl: "സൈലന്റ് വാലിയുടെ അതിർത്തി വനങ്ങളിൽ സഞ്ചാരികൾക്കായി ഒരുക്കിയ സുന്ദരമായ കാട്ടുപാത."
  }
];

const defaultBusRoutes: BusRouteItem[] = [
  {
    id: "bus_1",
    routeEn: "KOZHIKODE - ANAIKATTY (KSRTC)",
    routeMl: "കോഴിക്കോട് - ആനക്കട്ടി (KSRTC)",
    type: "KSRTC",
    busTypeEn: "KSRTC Fast Passenger",
    busTypeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ",
    runsEn: "Daily Service",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Inter-district Link",
    frequencyMl: "അന്തർ ജില്ലാ ലിങ്ക് സർവീസ്",
    timingsEn: "Via Manjeri, Melattur, Mannarkkad",
    timingsMl: "മഞ്ചേരി, മേലാറ്റൂർ, മണ്ണാർക്കാട് വഴി",
    list: [
      { time: "07:15", typeEn: "KOZHIKODE", typeMl: "കോഴിക്കോട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "10:45", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "11:45", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "12:15", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "12:50", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_2",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC - Morning Trip)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC - രാവിലത്തെ ട്രിപ്പ്)",
    type: "KSRTC",
    busTypeEn: "KSRTC Fast Passenger",
    busTypeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Morning Depot Service",
    frequencyMl: "രാവിലത്തെ പാലക്കാട് ഡിപ്പോ വണ്ടി",
    timingsEn: "Via Mannarkkad, Agali",
    timingsMl: "മണ്ണാർക്കാട്, അഗളി വഴി",
    list: [
      { time: "05:05", typeEn: "PALAKKAD", typeMl: "പാലക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "06:20", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "07:35", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:10", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:40", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_3",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC - Noon Trip)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC - ഉച്ചയ്ക്കുള്ള ട്രിപ്പ്)",
    type: "KSRTC",
    busTypeEn: "KSRTC Ordinary",
    busTypeMl: "KSRTC ഓർഡിനറി സർവീസ്",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Noon Depot Service",
    frequencyMl: "ഉച്ചയ്ക്ക് പാലക്കാട് ഡിപ്പോ വണ്ടി",
    timingsEn: "Via Mannarkkad, Agali",
    timingsMl: "മണ്ണാർക്കാട്, അഗളി വഴി",
    list: [
      { time: "11:20", typeEn: "PALAKKAD", typeMl: "പാലക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "12:40", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "13:40", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "14:15", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "14:45", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_4",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC - Evening Trip)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC - വൈകിട്ടുള്ള ട്രിപ്പ്)",
    type: "KSRTC",
    busTypeEn: "KSRTC Fast Passenger",
    busTypeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Evening Depot Service",
    frequencyMl: "വൈകിട്ട് പാലക്കാട് ഡിപ്പോ വണ്ടി",
    timingsEn: "Via Mannarkkad, Agali",
    timingsMl: "മണ്ണാർക്കാട്, അഗളി വഴി",
    list: [
      { time: "14:20", typeEn: "PALAKKAD", typeMl: "പാലക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "15:45", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "16:45", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "17:15", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "17:45", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_5",
    routeEn: "KOTTAYAM - ANAIKATTY (KSRTC SWIFT)",
    routeMl: "കോട്ടയം - ആനക്കട്ടി (KSRTC സ്വിഫ്റ്റ്)",
    type: "KSRTC",
    busTypeEn: "SWIFT Super Fast",
    busTypeMl: "സ്വിഫ്റ്റ് സൂപ്പർ ഫാസ്റ്റ്",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Long Route Interstate Connect",
    frequencyMl: "ദീർഘദൂര അന്തർസംസ്ഥാന കണക്റ്റിവിറ്റി",
    timingsEn: "Via Thrissur, Palakkad, Mannarkkad",
    timingsMl: "തൃശ്ശൂർ, പാലക്കാട്, മണ്ണാർക്കാട് വഴി",
    list: [
      { time: "05:00", typeEn: "KOTTAYAM", typeMl: "കോട്ടയം", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:30", typeEn: "THRISSUR", typeMl: "തൃശ്ശൂർ", viaCodeEn: "", viaCodeMl: "" },
      { time: "10:45", typeEn: "PALAKKAD", typeMl: "പാലക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "12:00", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "13:30", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "14:00", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_6",
    routeEn: "GURUVAYUR - ANAIKATTY (KSRTC)",
    routeMl: "ഗുരുവായൂർ - ആനക്കട്ടി (KSRTC)",
    type: "KSRTC",
    busTypeEn: "KSRTC Fast Passenger",
    busTypeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Pilgrim Connection Route",
    frequencyMl: "തീർത്ഥാടന സ്പെഷ്യൽ കണക്ഷൻ",
    timingsEn: "Via Shornur, Mannarkkad, Agali",
    timingsMl: "ഷൊർണൂർ, മണ്ണാർക്കാട്, അഗളി വഴി",
    list: [
      { time: "06:00", typeEn: "GURUVAYUR", typeMl: "ഗുരുവായൂർ", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:00", typeEn: "SHORNUR", typeMl: "ഷൊർണൂർ", viaCodeEn: "", viaCodeMl: "" },
      { time: "09:15", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "10:20", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "10:55", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_7",
    routeEn: "MANNARKKAD - ANAIKATTY (KSRTC - Morning Trip)",
    routeMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി (KSRTC - രാവിലെ)",
    type: "KSRTC",
    busTypeEn: "KSRTC Fast Passenger",
    busTypeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ",
    runsEn: "Daily Service",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Valley Connection",
    frequencyMl: "താലൂക്ക് കണക്ഷൻ സർവീസ്",
    timingsEn: "Via Mukkali, Agali, Goolikadavu",
    timingsMl: "മുക്കാലി, അഗളി, കൂളിക്കടവ് വഴി",
    list: [
      { time: "06:15", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "07:15", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:10", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:40", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_8",
    routeEn: "MANNARKKAD - ANAIKATTY (KSRTC - Night Stay)",
    routeMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി (KSRTC - രാത്രി സർവീസ്)",
    type: "KSRTC",
    busTypeEn: "KSRTC Ordinary Night Service",
    busTypeMl: "KSRTC നൈറ്റ് സ്റ്റേ ഓർഡിനറി",
    runsEn: "Daily Service",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Night Connectivity",
    frequencyMl: "രാത്രികാല ഗ്രാമീണ കണക്റ്റിവിറ്റി",
    timingsEn: "Via Mukkali, Agali Stay",
    timingsMl: "മുക്കാലി, അഗളി വലി (രാത്രി താമസം)",
    list: [
      { time: "18:00", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "19:00", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "19:40", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "20:10", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി (രാത്രി താമസം)", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_9",
    routeEn: "AGALI - PUDUR - MULLI (KSRTC)",
    routeMl: "അഗളി - പുതൂർ - മുള്ളി (KSRTC മലയോര വണ്ടി)",
    type: "KSRTC",
    busTypeEn: "KSRTC Forest Ordinary",
    busTypeMl: "KSRTC വനമേഖല മലയോര വണ്ടി",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Border Forest Route",
    frequencyMl: "വനമേഖലാ അതിർത്തി സർവീസ്",
    timingsEn: "Via Kottathara, Pudur",
    timingsMl: "കോട്ടത്തറ, പുതൂർ വഴി",
    list: [
      { time: "07:05", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "07:45", typeEn: "PUDUR", typeMl: "പുതൂർ", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:30", typeEn: "MULLI Checkpost", typeMl: "മുള്ളി ഫോറസ്റ്റ് ചെക്ക്പോസ്റ്റ്", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_10",
    routeEn: "ANAIKATTY - COIMBATORE (TNSTC)",
    routeMl: "ആനക്കട്ടി - കോയമ്പത്തൂർ (TNSTC)",
    type: "TNSTC",
    busTypeEn: "TNSTC Continuous Shuttles",
    busTypeMl: "തമിഴ്‌നാട് സർക്കാർ ഓർഡിനറി / എക്സ്പ്രസ്സ്",
    runsEn: "Border Shuttle (Every 30-40 mins)",
    runsMl: "അതിർത്തി ഷട്ടിൽ (ഓരോ 30-40 മിനിറ്റിലും)",
    frequencyEn: "Coimbatore Direct",
    frequencyMl: "കോയമ്പത്തൂർ ഗാന്ധിപുരം കണക്ഷൻ",
    timingsEn: "Via Kanuvai, Thadagam Road",
    timingsMl: "കണുവായി, തടാകം റോഡ് വഴി നിരന്തര ട്രിപ്പുകൾ",
    list: [
      { time: "06:00", typeEn: "ANAIKATTY BORDER", typeMl: "ആനക്കട്ടി അതിർത്തി", viaCodeEn: "", viaCodeMl: "" },
      { time: "06:40", typeEn: "KANUVAI", typeMl: "കണുവായി", viaCodeEn: "", viaCodeMl: "" },
      { time: "07:15", typeEn: "COIMBATORE", typeMl: "കോയമ്പത്തൂർ (ഗാന്ധിപുരം)", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_11",
    routeEn: "COIMBATORE - ANAIKATTY - AGALI (TNSTC)",
    routeMl: "കോയമ്പത്തൂർ - ആനക്കട്ടി - അഗളി (TNSTC)",
    type: "TNSTC",
    busTypeEn: "TNSTC Ordinary",
    busTypeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്",
    runsEn: "Daily Interstate Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Coimbatore Connection",
    frequencyMl: "കോയമ്പത്തൂർ സർവീസ്",
    timingsEn: "Via Thadagam Road, Kanuvai",
    timingsMl: "തടാകം റോഡ്, കണുവായി വഴി",
    list: [
      { time: "07:15", typeEn: "COIMBATORE", typeMl: "കോയമ്പത്തൂർ", viaCodeEn: "", viaCodeMl: "" },
      { time: "08:30", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" },
      { time: "09:00", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_12",
    routeEn: "MANNARKKAD - ANAIKATTY (PRIVATE)",
    routeMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി (സ്വകാര്യ ബസ്)",
    type: "PRIVATE",
    busTypeEn: "SRP (Private Stage Carrier)",
    busTypeMl: "SRP (സ്വകാര്യ ലിമിറ്റഡ് സ്റ്റോപ്പ്)",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Evening Expedition",
    frequencyMl: "വൈകുന്നേരത്തെ ട്രിപ്പ്",
    timingsEn: "Via Mukkali, Agali",
    timingsMl: "മുക്കാലി, അഗളി വഴി",
    list: [
      { time: "15:20", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" },
      { time: "16:20", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "17:20", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "17:50", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" }
    ]
  },
  {
    id: "bus_13",
    routeEn: "ANAIKKATI - MANNARKKAD (PRIVATE)",
    routeMl: "ആനക്കട്ടി - മണ്ണാർക്കാട് (സ്വകാര്യ ബസ്)",
    type: "PRIVATE",
    busTypeEn: "SRP (Private Stage Carrier)",
    busTypeMl: "SRP (സ്വകാര്യ ലിമിറ്റഡ് സ്റ്റോപ്പ്)",
    runsEn: "Daily Trip",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Morning Expedition",
    frequencyMl: "രാവിലത്തെ ട്രിപ്പ്",
    timingsEn: "Via Agali, Mukkali",
    timingsMl: "അഗളി, മുക്കാലി വഴി",
    list: [
      { time: "08:30", typeEn: "ANAIKKATTY", typeMl: "ആനക്കട്ടി", viaCodeEn: "", viaCodeMl: "" },
      { time: "09:00", typeEn: "AGALI", typeMl: "അഗളി", viaCodeEn: "", viaCodeMl: "" },
      { time: "09:50", typeEn: "MUKKALI", typeMl: "മുക്കാലി", viaCodeEn: "", viaCodeMl: "" },
      { time: "11:00", typeEn: "MANNARKKAD", typeMl: "മണ്ണാർക്കാട്", viaCodeEn: "", viaCodeMl: "" }
    ]
  }
];

const DEFAULT_MAP_NODES = [
  { id: "KOZHIKODE", x: 7, y: 32, nameEn: "Kozhikode", nameMl: "കോഴിക്കോട്" },
  { id: "MANJERI", x: 18, y: 40, nameEn: "Manjeri", nameMl: "മഞ്ചേരി" },
  { id: "GURUVAYUR", x: 9, y: 52, nameEn: "Guruvayur", nameMl: "ഗുരുവായൂർ" },
  { id: "THRISSUR", x: 14, y: 72, nameEn: "Thrissur", nameMl: "തൃശ്ശൂർ" },
  { id: "KOTTAYAM", x: 11, y: 92, nameEn: "Kottayam", nameMl: "കോട്ടയം" },
  { id: "KATTAPPANA", x: 16, y: 96, nameEn: "Kattappana", nameMl: "കട്ടപ്പന" },
  { id: "SHORNUR", x: 21, y: 64, nameEn: "Shornur", nameMl: "ഷൊർണൂർ" },
  { id: "CHERPULASSERY", x: 27, y: 56, nameEn: "Cherpulassery", nameMl: "ചെർപ്പുളശ്ശേരി" },
  { id: "PERINTHALMANNA", x: 30, y: 48, nameEn: "Perinthalmanna", nameMl: "പെരിന്തൽമണ്ണ" },
  { id: "PALAKKAD", x: 25, y: 84, nameEn: "Palakkad", nameMl: "പാലക്കാട്" },
  { id: "MANNARKKAD", x: 38, y: 60, nameEn: "Mannarkkad", nameMl: "മണ്ണാർക്കാട്" },
  { id: "MUKKALI", x: 50, y: 52, nameEn: "Mukkali", nameMl: "മുക്കാലി" },
  { id: "THAVALAM", x: 54, y: 49, nameEn: "Thavalam", nameMl: "താവളം" },
  { id: "GOOLIKKADAVU", x: 58, y: 47, nameEn: "Goolikkadavu", nameMl: "ഗൂളിക്കടവ്" },
  { id: "AGALI", x: 64, y: 44, nameEn: "Agali", nameMl: "അഗളി" },
  { id: "JELLIPPARA", x: 57, y: 41, nameEn: "Jellippara", nameMl: "ജെല്ലിപ്പാറ" },
  { id: "PALOOR", x: 63, y: 34, nameEn: "Paloor", nameMl: "പാലൂർ" },
  { id: "PUDUR", x: 62, y: 24, nameEn: "Pudur", nameMl: "പുതൂർ" },
  { id: "CHITTUR", x: 74, y: 31, nameEn: "Chittur", nameMl: "ചിറ്റൂർ" },
  { id: "MULLI", x: 74, y: 15, nameEn: "Mulli", nameMl: "മുള്ളി" },
  { id: "SHOLAYUR", x: 72, y: 44, nameEn: "Sholayur", nameMl: "ഷോളയൂർ" },
  { id: "ANAIKKATTY", x: 80, y: 44, nameEn: "Anaikatty", nameMl: "ആനക്കട്ടി" },
  { id: "METTUPALAYAM", x: 87, y: 28, nameEn: "Mettupalayam", nameMl: "മേട്ടുപ്പാളയം" },
  { id: "COIMBATORE", x: 92, y: 52, nameEn: "Coimbatore", nameMl: "കോയമ്പത്തൂർ" }
];

const DEFAULT_MAP_LINES = [
  { from: "KOZHIKODE", to: "MANJERI" },
  { from: "MANJERI", to: "PERINTHALMANNA" },
  { from: "GURUVAYUR", to: "SHORNUR" },
  { from: "THRISSUR", to: "PALAKKAD" },
  { from: "KOTTAYAM", to: "PALAKKAD" },
  { from: "KOTTAYAM", to: "KATTAPPANA" },
  { from: "SHORNUR", to: "CHERPULASSERY" },
  { from: "CHERPULASSERY", to: "PERINTHALMANNA" },
  { from: "CHERPULASSERY", to: "MANNARKKAD" },
  { from: "PERINTHALMANNA", to: "MANNARKKAD" },
  { from: "PALAKKAD", to: "MANNARKKAD" },
  { from: "MANNARKKAD", to: "MUKKALI" },
  { from: "MUKKALI", to: "THAVALAM" },
  { from: "THAVALAM", to: "GOOLIKKADAVU" },
  { from: "GOOLIKKADAVU", to: "AGALI" },
  { from: "AGALI", to: "PALOOR" },
  { from: "PALOOR", to: "PUDUR" },
  { from: "PUDUR", to: "MULLI" },
  { from: "MULLI", to: "METTUPALAYAM" },
  { from: "AGALI", to: "SHOLAYUR" },
  { from: "SHOLAYUR", to: "ANAIKKATTY" },
  { from: "ANAIKKATTY", to: "COIMBATORE" },
  { from: "COIMBATORE", to: "METTUPALAYAM" }
];

export default function ExploreAttappadi({ lang, initialTab = "destinations", isAdmin = false, hideTabsSelection = false }: ExploreAttappadiProps) {
  const safeParseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map(x => x.trim()).filter(Boolean);
    return [];
  };

  const [activeTab, setActiveTab] = useState<"destinations" | "food" | "stays" | "travelogues" | "photos" | "culture" | "busTimings">(initialTab);

  const [mapNodes, setMapNodes] = useState<{ id: string; x: number; y: number; nameEn: string; nameMl: string }[]>(() => {
    try {
      const saved = localStorage.getItem("attappadi_map_nodes2");
      return saved ? JSON.parse(saved) : DEFAULT_MAP_NODES;
    } catch (e) {
      return DEFAULT_MAP_NODES;
    }
  });

  const [mapLines, setMapLines] = useState<{ from: string; to: string }[]>(() => {
    try {
      const saved = localStorage.getItem("attappadi_map_lines2");
      return saved ? JSON.parse(saved) : DEFAULT_MAP_LINES;
    } catch (e) {
      return DEFAULT_MAP_LINES;
    }
  });

  const [isMapEditorOpen, setIsMapEditorOpen] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedEditorNodeId, setSelectedEditorNodeId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [editorTab, setEditorTab] = useState<"nodes" | "branching" | "export">("nodes");

  // Safeguard: Ensure the map editor is forced closed if the user is not an Admin
  useEffect(() => {
    if (!isAdmin) {
      setIsMapEditorOpen(false);
    }
  }, [isAdmin]);

  // Unified automatic local storage sync managers to handle real-time modifications flawlessly
  useEffect(() => {
    if (mapNodes && mapNodes.length > 0) {
      localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes));
    }
  }, [mapNodes]);

  useEffect(() => {
    if (mapLines) {
      localStorage.setItem("attappadi_map_lines2", JSON.stringify(mapLines));
    }
  }, [mapLines]);

  const [destinationsList, setDestinationsList] = useState<DestinationItem[]>(defaultDestinations);
  const [culturesList, setCulturesList] = useState<CultureItem[]>(defaultCultures);
  const [staysList, setStaysList] = useState<StayItem[]>(defaultStays);
  const [traveloguesList, setTraveloguesList] = useState<TravelogueItem[]>(defaultTravelogues);
  const [photosList, setPhotosList] = useState<PhotoItem[]>(defaultPhotos);
  const [busRoutesList, setBusRoutesList] = useState<BusRouteItem[]>(defaultBusRoutes);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // Bus timings search & filter state
  const [busSearch, setBusSearch] = useState("");
  const [busTypeFilter, setBusTypeFilter] = useState("ALL");
  const [selectedMapStop, setSelectedMapStop] = useState<string>("AGALI");
  const [navSource, setNavSource] = useState<string>("MANNARKKAD");
  const [navDest, setNavDest] = useState<string>("ANAIKKATTY");
  const [selectedAssistPlace, setSelectedAssistPlace] = useState<string>("silent_valley");
  const [busTimingMode, setBusTimingMode] = useState<"stop" | "directions" | "assist">("stop");

  const refreshDynamicContent = () => {
    fetch("/api/destinations")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setDestinationsList(data); })
      .catch(err => console.error("Error loading destinations:", err));

    fetch("/api/cultures")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setCulturesList(data); })
      .catch(err => console.error("Error loading cultures:", err));

    fetch("/api/stays")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setStaysList(data); })
      .catch(err => console.error("Error loading stays:", err));

    fetch("/api/travelogues")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setTraveloguesList(data); })
      .catch(err => console.error("Error loading travelogues:", err));

    fetch("/api/photos")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPhotosList(data); })
      .catch(err => console.error("Error loading photos:", err));

    fetch("/api/busroutes")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setBusRoutesList(data); })
      .catch(err => console.error("Error loading bus routes:", err));
  };

  // Fetch when segment boots
  useEffect(() => {
    refreshDynamicContent();
    const interval = setInterval(refreshDynamicContent, 8000); // live sync
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="explore-attappadi-section" className={hideTabsSelection 
      ? "bg-white space-y-4 animate-fade-in" 
      : "bg-white border-t-4 border-[#052962] rounded-lg shadow-sm p-5 md:p-8 space-y-8 animate-fade-in"
    }>
      
      {/* Editorial Header */}
      {!hideTabsSelection && (
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Compass className="w-5 h-5 text-[#c70000] animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[10px] bg-[#c70000] text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {lang === "en" ? "Interactive Travel Desk" : "സഞ്ചാര ഡെസ്ക്"}
            </span>
          </div>
          <h2 className="font-serif-guardian font-extrabold text-[#052962] text-2xl md:text-4.5xl leading-tight">
            {lang === "en" ? "Explore Attappadi Valley" : "അട്ടപ്പാടിയെ അറിയാം..."}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-3xl leading-relaxed">
            {lang === "en" 
              ? "Immerse yourself in India's richest biodiversity, pristine flowing rivers, spiritual peaks, rare tribal gastronomy, and organic eco-tourism experiences from Silent Valley to Sholayur."
              : "സൈലന്റ് വാലി മുതൽ ഷോളയൂർ വരെയുള്ള അട്ടപ്പാടിയുടെ സമൃദ്ധമായ വനസംസ്കാരം, ഒഴുകുന്ന നിത്യഹരിത പുഴകൾ, ആത്മീയ കൊടുമുടികൾ, അപൂർവ ഗോത്രവിഭവങ്ങൾ, പ്രകൃതി സ്നേഹികളുടെ താമസ സൗകര്യങ്ങൾ എന്നിവ ഇവിടെ കണ്ടെത്താം."
            }
          </p>
        </div>
      )}

      {/* Modern Filter Strip */}
      {!hideTabsSelection && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {[
            { key: "destinations", labelEn: "Destinations", icon: <Compass className="w-3.5 h-3.5" /> },
            { key: "culture", labelEn: "Culture & Food", icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
            { key: "stays", labelEn: "Nature Stays", icon: <Hotel className="w-3.5 h-3.5" /> },
            { key: "travelogues", labelEn: "Travelogues", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { key: "photos", labelEn: "Photo Hub", icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { key: "busTimings", labelEn: "Bus Timings", icon: <Bus className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-md text-xs font-bold transition duration-200 flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                (activeTab === tab.key || (tab.key === "culture" && activeTab === "food"))
                  ? "bg-[#052962] text-[#ffe500] shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.icon}
              {tab.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Tab Contents */}
      <div className={hideTabsSelection ? "" : "pt-2"}>

        {/* 1. DESTINATIONS TAB */}
        {activeTab === "destinations" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destinationsList.map((dest) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={dest.id} 
                className="bg-[#fcfcfb] border border-gray-100 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-100">
                    <img 
                      src={dest.image} 
                      alt={dest.nameEn} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded tracking-wide uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#ffe500]" />
                      {lang === "en" ? dest.locationEn : dest.locationMl}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif-guardian font-extrabold text-[#052962] text-lg md:text-xl">
                      {lang === "en" ? dest.nameEn : dest.nameMl}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      {lang === "en" ? dest.descriptionEn : dest.descriptionMl}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1">
                  <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-1.5">
                    {safeParseArray(lang === "en" ? dest.highlightsEn : dest.highlightsMl).map((highlight, index) => (
                      <span key={index} className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                        ✓ {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 2. CULTURE & FOOD TAB */}
        {(activeTab === "culture" || activeTab === "food") && (
          <div className="space-y-6">
            {culturesList.map((cult, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={cult.id || i} 
                className="bg-[#fcfcfb] border border-gray-100 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-4 hover:shadow-xs transition"
              >
                <div className="md:col-span-4 max-h-[220px] md:max-h-full aspect-video md:aspect-auto bg-slate-100">
                  <img src={cult.image} alt={cult.titleEn} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                </div>
                <div className="md:col-span-8 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded tracking-wide uppercase border border-red-100">
                      {cult.type === "food" ? (lang === "en" ? "Gastronomy" : "ഭക്ഷണപാരമ്പര്യം") : (lang === "en" ? "Arts & Heritage" : "കലയും സംസ്‌കാരവും")}
                    </span>
                    <h3 className="font-serif-guardian font-extrabold text-slate-900 text-lg md:text-xl pt-1">
                      {lang === "en" ? cult.titleEn : cult.titleMl}
                    </h3>
                    <h5 className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                      {lang === "en" ? cult.subtitleEn : cult.subtitleMl}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {lang === "en" ? cult.descEn : cult.descMl}
                    </p>
                  </div>
                  <div className="bg-[#052962]/5 border-l-4 border-[#052962] p-2.5 rounded-r">
                    <p className="text-[11px] font-bold text-[#052962] flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                      {lang === "en" ? cult.elementEn : cult.elementMl}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 3. NATURE STAYS TAB */}
        {activeTab === "stays" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staysList.map((stay, ind) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={stay.id || ind} 
                className="bg-[#fcfcfb] border border-gray-100 rounded-lg overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-100">
                    <img 
                      src={stay.image} 
                      alt={stay.nameEn} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-green-700 text-white font-extrabold text-[9px] px-2 py-0.5 rounded tracking-wide uppercase shadow">
                      {lang === "en" ? stay.typeEn : stay.typeMl}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {lang === "en" ? stay.locationEn : stay.locationMl}
                    </span>
                    <h4 className="font-serif-guardian font-bold text-gray-800 text-sm md:text-base leading-snug">
                      {lang === "en" ? stay.nameEn : stay.nameMl}
                    </h4>
                    <ul className="space-y-1 pt-1.5">
                      {(() => {
                        const featsEn = safeParseArray(stay.featuresEn);
                        const featsMl = safeParseArray(stay.featuresMl);
                        return featsEn.map((feat, fIdx) => (
                          <li key={fIdx} className="text-[10px] text-gray-400 flex items-center gap-1">
                            <span className="text-emerald-600 font-black">✔</span>
                            {lang === "en" ? feat : (featsMl[fIdx] || feat)}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{lang === "en" ? "Rate Estimate" : "നിരക്ക്"}</span>
                  <span className="text-xs font-black text-[#c70000]">{lang === "en" ? stay.priceEn : stay.priceMl}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 4. TRAVELOGUES TAB */}
        {activeTab === "travelogues" && (
          <div className="space-y-6">
            {traveloguesList.map((tr, index) => (
              <motion.article 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={tr.id || index} 
                className="p-5 md:p-6 bg-[#fcfcfb] border border-gray-100 rounded-lg space-y-3 shadow-xs hover:border-gray-200 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-[#c70000] uppercase tracking-wider bg-red-50 border border-red-100 px-1.5 py-0.5 rounded inline-block">
                      {lang === "en" ? "Bilingual Narrative" : "യാത്രാക്കുറിപ്പ്"}
                    </span>
                    <h3 className="font-serif-guardian font-extrabold text-gray-900 text-lg md:text-xl">
                      {lang === "en" ? tr.titleEn : tr.titleMl}
                    </h3>
                  </div>
                  <span className="text-[10px] whitespace-nowrap text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {lang === "en" ? tr.readTimeEn : tr.readTimeMl}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                  "{lang === "en" ? tr.snippetEn : tr.snippetMl}"
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <span>
                    By <strong className="text-gray-600">{lang === "en" ? tr.authorEn : tr.authorMl}</strong>
                  </span>
                  <span>Published: {tr.date}</span>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* 5. PHOTO HUB GALLERY TAB */}
        {activeTab === "photos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photosList.map((ph, idx) => (
                <div
                  key={ph.id || idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className="group relative aspect-square bg-slate-100 rounded-md overflow-hidden cursor-pointer hover:shadow hover:scale-[1.01] transition duration-200"
                >
                  <img 
                    src={ph.url} 
                    alt={ph.titleEn} 
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <div className="text-white text-[10px] space-y-0.5 truncate">
                      <p className="font-bold truncate">{lang === "en" ? ph.titleEn : ph.titleMl}</p>
                      <p className="text-slate-300 text-[8px] truncate">{lang === "en" ? "Click to expand" : "വലുതാക്കി കാണാൻ ക്ലിക്ക് ചെയ്യുക"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox / Slideshow Modal */}
            <AnimatePresence>
              {selectedPhotoIndex !== null && photosList[selectedPhotoIndex] && (
                <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
                  <div className="relative max-w-4xl w-full flex flex-col items-center">
                    
                    {/* Close Trigger icon */}
                    <button
                      onClick={() => setSelectedPhotoIndex(null)}
                      className="absolute -top-12 right-0 p-2 text-white bg-slate-800 hover:bg-slate-700 hover:text-red-400 rounded-full transition cursor-pointer"
                      title="Close Lightbox"
                    >
                      <X className="w-5 h-5 font-bold" />
                    </button>

                    {/* Active Lightbox Image */}
                    <div className="relative aspect-video max-h-[70vh] w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-white/10">
                      <img 
                        src={photosList[selectedPhotoIndex].url} 
                        alt={photosList[selectedPhotoIndex].titleEn} 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />

                      {/* Direction Controls */}
                      <button
                        onClick={() => setSelectedPhotoIndex(prev => (prev !== null ? (prev - 1 + photosList.length) % photosList.length : null))}
                        className="absolute left-4 p-2.5 bg-slate-950/70 hover:bg-slate-950 text-white hover:text-[#ffe500] rounded-full transition cursor-pointer"
                        title="Prev"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedPhotoIndex(prev => (prev !== null ? (prev + 1) % photosList.length : null))}
                        className="absolute right-4 p-2.5 bg-slate-950/70 hover:bg-slate-950 text-white hover:text-[#ffe500] rounded-full transition cursor-pointer"
                        title="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Bottom overlay text detail */}
                    <div className="w-full text-center text-white mt-4 space-y-1 px-4">
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                        {lang === "en" ? `Photo ${selectedPhotoIndex + 1} of ${photosList.length}` : `ചിത്രം ${selectedPhotoIndex + 1} / ${photosList.length}`}
                      </span>
                      <h4 className="font-serif-guardian font-extrabold text-base md:text-xl text-[#ffe500]">
                        {lang === "en" ? photosList[selectedPhotoIndex].titleEn : photosList[selectedPhotoIndex].titleMl}
                      </h4>
                      <p className="text-xs text-slate-300 font-light max-w-lg mx-auto">
                        {lang === "en" ? photosList[selectedPhotoIndex].descEn : photosList[selectedPhotoIndex].descMl}
                      </p>
                    </div>

                  </div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* 6. BUS TIMINGS TAB */}
        {activeTab === "busTimings" && (() => {
          // Normalize stop names to match against user inputs safely
          const normalizeStopName = (name: string): string => {
            if (!name) return "";
            const n = name.toUpperCase().replace(/\s+/g, "").trim();
            if (n.includes("ANAIKKATTY") || n.includes("ANAIKATTY") || n.includes("ANAIKKATI") || n.includes("ANAIKATI")) return "ANAIKKATTY";
            if (n.includes("MULLI")) return "MULLI";
            if (n.includes("PUDUR")) return "PUDUR";
            if (n.includes("AGALI")) return "AGALI";
            if (n.includes("MUKKALI")) return "MUKKALI";
            if (n.includes("MANNARKKAD") || n.includes("MANNARKAD")) return "MANNARKKAD";
            if (n.includes("PALAKKAD") || n.includes("PALAKAD")) return "PALAKKAD";
            if (n.includes("COIMBATORE") || n.includes("KOVAI")) return "COIMBATORE";
            if (n.includes("KOZHIKODE") || n.includes("CALICUT")) return "KOZHIKODE";
            if (n.includes("THRISSUR") || n.includes("TRICHUR")) return "THRISSUR";
            if (n.includes("GURUVAYUR")) return "GURUVAYUR";
            if (n.includes("KOTTAYAM")) return "KOTTAYAM";
            if (n.includes("MANJERI")) return "MANJERI";
            if (n.includes("KATTAPPANA")) return "KATTAPPANA";
            if (n.includes("SHORNUR") || n.includes("SHORANUR")) return "SHORNUR";
            if (n.includes("PERINTHALMANNA") || n.includes("PERINTALMANNA") || n.includes("PERINTHAL MANNA")) return "PERINTHALMANNA";
            if (n.includes("CHERPULASSERY") || n.includes("CHERPPULASSERY") || n.includes("CHERPULASSERI")) return "CHERPULASSERY";
            if (n.includes("PALOOR") || n.includes("PALUR")) return "PALOOR";
            if (n.includes("THAVALAM") || n.includes("TAVALAM")) return "THAVALAM";
            if (n.includes("METTUPALAYAM") || n.includes("METTUPALAYAM")) return "METTUPALAYAM";
            if (n.includes("SHOLAYUR")) return "SHOLAYUR";
            if (n.includes("GOOLIKKADAVU") || n.includes("GULIKKADAVU") || n.includes("GOOLIKADAVU")) return "GOOLIKKADAVU";
            return n;
          };

          // Define all unique stops for dropdown choices mapped dynamically from state
          const stopChoices = mapNodes.map(node => ({
            id: node.id,
            en: node.nameEn,
            ml: node.nameMl
          }));

          // Sightseeing hotspots and their corresponding transit stops
          interface AssistHotspot {
            id: string;
            nameEn: string;
            nameMl: string;
            nearestStop: string;
            distanceEn: string;
            distanceMl: string;
            guideEn: string;
            guideMl: string;
          }

          const assistHotspots: AssistHotspot[] = [
            {
              id: "silent_valley",
              nameEn: "Silent Valley National Park",
              nameMl: "സൈലന്റ് വാലി നാഷണൽ പാർക്ക്",
              nearestStop: "MUKKALI",
              distanceEn: "0 km (Entry counter is Mukkali)",
              distanceMl: "0 കി.മീ (പ്രവേശന കവാടം മുക്കാലിയിലാണ്)",
              guideEn: "Board any bus to Mukkali, then register at Forest Dept for jeep safari.",
              guideMl: "മുക്കാലിയിലേക്ക് പോകുന്ന ഏതെങ്കിലും ബസിൽ കയറുക. തുടർന്ന് റേഞ്ച് ഓഫീസിൽ നിന്ന് പായ്ക്കേജ് സഫാരി തിരഞ്ഞെടുക്കാം."
            },
            {
              id: "siruvani",
              nameEn: "Siruvani Dam & Waterfalls",
              nameMl: "സിരുവാണി ഡാമും വെള്ളച്ചാട്ടവും",
              nearestStop: "AGALI",
              distanceEn: "14 km from Agali town",
              distanceMl: "അഗളി ടൗണിൽ നിന്ന് 14 കി.മീ",
              guideEn: "Get down at Agali station. Hiring a local taxi or jeep via Goolikadavu is recommended.",
              guideMl: "അഗളിയിൽ ഇറങ്ങി കൂളിക്കടവ് വഴി പോകുന്ന ട്രൈബൽ ജീപ്പ് അല്ലെങ്കിൽ ലോക്കൽ ടാക്സി തിരഞ്ഞെടുക്കുക."
            },
            {
              id: "malleswara",
              nameEn: "Malleswara Temple & Shivarathri Peak",
              nameMl: "മല്ലേശ്വരൻ കോവിലും ശിവരാത്രി മലയും",
              nearestStop: "AGALI",
              distanceEn: "6 km from Agali town",
              distanceMl: "അഗളി ടൗണിൽ നിന്ന് 6 കി.മീ",
              guideEn: "Alight at Agali bus point. The mighty peak is fully visible from Agali center.",
              guideMl: "അഗളി ബസ് സ്റ്റോപ്പിൽ ഇറങ്ങുക. അട്ടപ്പാടിയുടെ കാവൽ ദൈവമായ ഈ കൊടുമുടി അഗളിയിൽ നിന്ന് വ്യക്തമായി കാണാം."
            },
            {
              id: "sholayur",
              nameEn: "Sholayur Windmill Farms",
              nameMl: "ഷോളയൂർ കാറ്റാടിയന്ത്ര മലനിരകൾ",
              nearestStop: "ANAIKKATTY",
              distanceEn: "8 km from Anaikatty",
              distanceMl: "ആനക്കട്ടിയിൽ നിന്ന് 8 കി.മീ",
              guideEn: "Travel to Anaikatty border terminal. Connect easily with local transport toward Sholayur loop.",
              guideMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി ബസിൽ കയറി അവസാന സ്റ്റോപ്പായ ആനക്കട്ടിയിൽ ഇറങ്ങുക. അവിടെനിന്ന് ഷോളയൂർ റോഡിലേക്ക് ലോക്കൽ ഓട്ടോറിക്ഷകൾ ലഭിക്കും."
            },
            {
              id: "pudur_tribal",
              nameEn: "Pudur Heritage Tribal Area",
              nameMl: "പുതൂർ ഗോത്ര പൈതൃക ഗ്രാമം",
              nearestStop: "PUDUR",
              distanceEn: "0 km (Direct center on route)",
              distanceMl: "0 കി.മീ (റൂട്ടിൽ തന്നെയാണ്)",
              guideEn: "Forest ordinary buses leaving Agali go directly up through Pudur center.",
              guideMl: "അഗളിയിൽ നിന്നും കോട്ടത്തറ വഴി പോകുന്ന മുള്ളി ബസിൽ കയറിയാൽ പുതൂരിൽ നേരിട്ട് ഇറങ്ങാം."
            },
            {
              id: "mulli_border",
              nameEn: "Mulli Valley (Ooty Western Ghats Road)",
              nameMl: "മുള്ളി വ്യൂ പോയിന്റ് (ഊട്ടി ചുരം വഴി)",
              nearestStop: "MULLI",
              distanceEn: "0 km (Ghat gateway)",
              distanceMl: "0 കി.മീ (അതിർത്തി ചെക്ക്പോസ്റ്റ്)",
              guideEn: "Final terminus for deep hills KSRTC line. Rugged hairpins connect directly with Nilgiri heights.",
              guideMl: "അഗളിയിൽ നിന്നുള്ള കെ.എസ്.ആർ.ടി.സി ഓർഡിനറിയുടെ അവസാന സ്റ്റോപ്പാണ് മുള്ളി. ഇവിടെ നിന്ന് മഞ്ചൂർ ചുരം വഴി ഊട്ടിയിലേക്ക് പോകാം."
            }
          ];

          // 1. Departures Lookup (Station Board)
          const currentMapStopEntity = stopChoices.find(sc => sc.id === selectedMapStop) || stopChoices[7];
          const stopDepartures = busRoutesList.flatMap((route) => {
            const normSearch = normalizeStopName(selectedMapStop);
            const stopIndex = route.list.findIndex(item => normalizeStopName(item.typeEn) === normSearch);
            
            if (stopIndex !== -1) {
              const transitStop = route.list[stopIndex];
              const remainingStops = route.list.slice(stopIndex + 1);
              const headingToEn = remainingStops.length > 0 ? remainingStops[remainingStops.length - 1].typeEn : "Terminus";
              const headingToMl = remainingStops.length > 0 ? remainingStops[remainingStops.length - 1].typeMl : "അവസാന സ്റ്റേഷൻ";
              
              return {
                routeId: route.id,
                routeEn: route.routeEn,
                routeMl: route.routeMl,
                busTypeEn: route.busTypeEn,
                busTypeMl: route.busTypeMl,
                time: transitStop.time,
                headingToEn,
                headingToMl,
                typeLabel: route.type,
                fullList: route.list,
                privateBusName: route.privateBusName
              };
            }
            return [];
          }).sort((a, b) => a.time.localeCompare(b.time));

          // 2. Directions Router Search
          const directionsResults = busRoutesList.flatMap((route) => {
            const normSrc = normalizeStopName(navSource);
            const normDst = normalizeStopName(navDest);
            
            const srcIdx = route.list.findIndex(item => normalizeStopName(item.typeEn) === normSrc);
            const dstIdx = route.list.findIndex(item => normalizeStopName(item.typeEn) === normDst);
            
            if (srcIdx !== -1 && dstIdx !== -1 && srcIdx < dstIdx) {
              const depTime = route.list[srcIdx].time;
              const arrTime = route.list[dstIdx].time;
              
              return {
                routeId: route.id,
                routeEn: route.routeEn,
                routeMl: route.routeMl,
                busTypeEn: route.busTypeEn,
                busTypeMl: route.busTypeMl,
                typeLabel: route.type,
                depTime,
                arrTime,
                fullList: route.list,
                privateBusName: route.privateBusName
              };
            }
            return [];
          }).sort((a, b) => a.depTime.localeCompare(b.depTime));

          // 3. Spotted Place Finder helper
          const activeSpot = assistHotspots.find(ah => ah.id === selectedAssistPlace) || assistHotspots[0];
          const spotDepartures = busRoutesList.flatMap((route) => {
            const normSearch = normalizeStopName(activeSpot.nearestStop);
            const stopIndex = route.list.findIndex(item => normalizeStopName(item.typeEn) === normSearch);
            
            if (stopIndex !== -1) {
              const transitStop = route.list[stopIndex];
              const remainingStops = route.list.slice(stopIndex + 1);
              const headingToEn = remainingStops.length > 0 ? remainingStops[remainingStops.length - 1].typeEn : "Terminus";
              const headingToMl = remainingStops.length > 0 ? remainingStops[remainingStops.length - 1].typeMl : "അവസാന സ്റ്റേഷൻ";
              
              return {
                routeId: route.id,
                routeEn: route.routeEn,
                routeMl: route.routeMl,
                busTypeEn: route.busTypeEn,
                busTypeMl: route.busTypeMl,
                time: transitStop.time,
                headingToEn,
                headingToMl,
                typeLabel: route.type,
                fullList: route.list,
                privateBusName: route.privateBusName
              };
            }
            return [];
          }).sort((a, b) => a.time.localeCompare(b.time));

          // Mapped dynamically from top-level mapLines state

          return (
            <div className="space-y-6 animate-fade-in font-anek-malayalam">
              
              {/* Disclaimer and Help Desk Box */}
              <div className="bg-[#052962]/5 border-l-4 border-[#052962] p-4 rounded-r-md flex gap-3 text-xs text-[#052962]" style={{ contentVisibility: 'auto' }}>
                <Info className="w-5 h-5 text-[#052962] shrink-0 mt-0.5" />
                <div className="space-y-1 font-anek-malayalam">
                  <p className="font-extrabold text-[13px] text-[#052962]">
                    യാത്രക്കാരുടെ വിവരത്തിന് (Attappadi Transit Help):
                  </p>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    ചുരം റോഡിലെ മൂടൽമഞ്ഞ്, കനത്ത മഴ, വനമേഖലയിലെ സമയനിയന്ത്രണങ്ങൾ എന്നിവ കാരണം സമയക്രമങ്ങളിൽ നേരിയ വ്യത്യാസങ്ങൾ വന്നേക്കാം. പ്രധാന ജംഗ്ഷൻ കേന്ദ്രങ്ങളിലെ കൃത്യവിവരങ്ങൾക്ക് ലഭ്യമായ കെ.എസ്.ആർ.ടി.സി ഹെൽപ്പ് നമ്പറിൽ ബന്ധപ്പെടുക. (അഗളി ബസ് സ്റ്റേഷൻ ഫോൺ: <span className="font-bold underline text-[#052962]">04924-254400</span>)
                  </p>
                </div>
              </div>

              {/* Navigation Style Sub Menu */}
              <div className="flex border-b border-slate-200">
                {[
                  { key: "stop", label: "സ്റ്റേഷൻ ബോർഡ് (Hub Board)", icon: <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> },
                  { key: "directions", label: "ഗൂഗിൾ മാപ്പ് റൂട്ടിംഗ് (Directions Finder)", icon: <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" /> },
                  { key: "assist", label: "വിനോദസഞ്ചാര കേന്ദ്രങ്ങൾ (Nearest Stops)", icon: <Info className="w-3.5 h-3.5 text-teal-500 shrink-0" /> }
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setBusTimingMode(m.key as any)}
                    className={`flex-1 py-3 text-center text-xs font-black transition duration-200 cursor-pointer border-b-2 font-anek-malayalam flex items-center justify-center gap-1.5 ${
                      busTimingMode === m.key
                        ? "border-[#052962] text-[#052962] bg-[#052962]/5"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Master Responsive Layout split into sidebar panel & Vector Map */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start font-anek-malayalam">
                
                {/* Visual Map widget - Highlight of modern responsive interface */}
                <div className="xl:col-span-5 order-first xl:order-last space-y-4">
                  <div className="bg-[#eef2ef] border border-slate-300 rounded-xl p-4 shadow-sm relative overflow-hidden select-none">
                    
                    {/* Header Map indicators */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 bg-white/70 backdrop-blur-xs p-2.5 rounded-lg">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block font-anek-malayalam">
                          INTERACTIVE GEOGRAPHIC MAP
                        </span>
                        <h5 className="font-extrabold text-[#052962] text-xs font-anek-malayalam">
                          അട്ടപ്പാടി വാലി ബസ് നെറ്റ്‌വർക്ക് ചാർട്ട്
                        </h5>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-[#ffe500] font-bold px-2 py-0.5 rounded shadow-xs">
                        LIVE HUD
                      </span>
                    </div>

                      {/* SVG Canvas Map */}
                      <div className="relative aspect-[4/3] w-full mt-3 bg-white/40 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
                        
                        {/* Background decorative geographic contours or river */}
                        <svg 
                          viewBox="0 0 100 100" 
                          className="w-full h-full"
                          onMouseMove={(e) => {
                            if (isMapEditorOpen && draggedNodeId) {
                              const svg = e.currentTarget;
                              const rect = svg.getBoundingClientRect();
                              const currentX = ((e.clientX - rect.left) / rect.width) * 100;
                              const currentY = ((e.clientY - rect.top) / rect.height) * 100;
                              const calculatedX = Math.round(currentX - dragOffset.x);
                              const calculatedY = Math.round(currentY - dragOffset.y);
                              const clampedX = Math.max(1, Math.min(99, calculatedX));
                              const clampedY = Math.max(1, Math.min(99, calculatedY));
                              
                              setMapNodes((prev) => prev.map((n) => n.id === draggedNodeId ? { ...n, x: clampedX, y: clampedY } : n));
                            }
                          }}
                          onMouseUp={() => {
                            if (draggedNodeId) {
                              setDraggedNodeId(null);
                            }
                          }}
                          onMouseLeave={() => {
                            if (draggedNodeId) {
                              setDraggedNodeId(null);
                            }
                          }}
                          onTouchMove={(e) => {
                            if (isMapEditorOpen && draggedNodeId) {
                              const touch = e.touches[0];
                              if (touch) {
                                const svg = e.currentTarget;
                                const rect = svg.getBoundingClientRect();
                                const currentX = ((touch.clientX - rect.left) / rect.width) * 100;
                                const currentY = ((touch.clientY - rect.top) / rect.height) * 100;
                                const calculatedX = Math.round(currentX - dragOffset.x);
                                const calculatedY = Math.round(currentY - dragOffset.y);
                                const clampedX = Math.max(1, Math.min(99, calculatedX));
                                const clampedY = Math.max(1, Math.min(99, calculatedY));
                                
                                setMapNodes((prev) => prev.map((n) => n.id === draggedNodeId ? { ...n, x: clampedX, y: clampedY } : n));
                              }
                            }
                          }}
                          onTouchEnd={() => {
                            if (draggedNodeId) {
                              setDraggedNodeId(null);
                            }
                          }}
                          onTouchCancel={() => {
                            if (draggedNodeId) {
                              setDraggedNodeId(null);
                            }
                          }}
                        >
                        
                        
                        {/* Grid overlay when editing */}
                        {isMapEditorOpen && (
                          <g stroke="#3b82f6" strokeWidth="0.06" strokeDasharray="1 2" opacity="0.25">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <React.Fragment key={i}>
                                <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="#3b82f6" />
                                <line x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="#3b82f6" />
                              </React.Fragment>
                            ))}
                          </g>
                        )}

                        {/* Connection Highways Lines */}
                        {mapLines.map((line, idx) => {
                          const nFrom = mapNodes.find(n => n.id === line.from);
                          const nTo = mapNodes.find(n => n.id === line.to);
                          if (!nFrom || !nTo) return null;

                          // Check if this line is part of currently matched route directions
                          let isMatchedLine = false;
                          if (busTimingMode === "directions" && directionsResults.length > 0) {
                            const currentActiveRoute = directionsResults[0]; 
                            const activeStops = currentActiveRoute.fullList;
                            const idxFrom = activeStops.findIndex(s => normalizeStopName(s.typeEn) === normalizeStopName(line.from));
                            const idxTo = activeStops.findIndex(s => normalizeStopName(s.typeEn) === normalizeStopName(line.to));
                            if (idxFrom !== -1 && idxTo !== -1 && Math.abs(idxFrom - idxTo) <= 2) {
                              isMatchedLine = true;
                            }
                          } else if (busTimingMode === "stop") {
                            // Highlight lines going through the selected stop node
                            isMatchedLine = (line.from === selectedMapStop || line.to === selectedMapStop);
                          } else if (busTimingMode === "assist") {
                            // Highlight nearest stop of the chosen place
                            isMatchedLine = (line.from === activeSpot.nearestStop || line.to === activeSpot.nearestStop);
                          }

                          return (
                            <g key={idx}>
                              <line
                                x1={nFrom.x}
                                y1={nFrom.y}
                                x2={nTo.x}
                                y2={nTo.y}
                                stroke={isMatchedLine ? "#ffe500" : "#cbd5e1"}
                                strokeWidth={isMatchedLine ? "2.5" : "1.25"}
                                strokeLinecap="round"
                              />
                              {isMatchedLine && (
                                <line
                                  x1={nFrom.x}
                                  y1={nFrom.y}
                                  x2={nTo.x}
                                  y2={nTo.y}
                                  stroke="#052962"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeDasharray="3 3"
                                  className="animate-[dash_15s_linear_infinite]"
                                />
                              )}
                            </g>
                          );
                        })}

                        {/* Interactive Nodes circles */}
                        {mapNodes.map((node) => {
                          const isSelectedNode = 
                            (busTimingMode === "stop" && node.id === selectedMapStop) ||
                            (busTimingMode === "directions" && (node.id === navSource || node.id === navDest)) ||
                            (busTimingMode === "assist" && node.id === activeSpot.nearestStop);
                          const isEditorSelected = isMapEditorOpen && node.id === selectedEditorNodeId;

                          return (
                            <g 
                              key={node.id} 
                              onMouseDown={(e) => {
                                if (isMapEditorOpen) {
                                  e.preventDefault();
                                  const svg = e.currentTarget.ownerSVGElement;
                                  if (svg) {
                                    const rect = svg.getBoundingClientRect();
                                    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                                    const clickY = ((e.clientY - rect.top) / rect.height) * 105; // Note: using 100 aspect scaling
                                    const normalizedY = ((e.clientY - rect.top) / rect.height) * 100;
                                    setDragOffset({
                                      x: clickX - node.x,
                                      y: normalizedY - node.y
                                    });
                                  } else {
                                    setDragOffset({ x: 0, y: 0 });
                                  }
                                  setDraggedNodeId(node.id);
                                  setSelectedEditorNodeId(node.id);
                                }
                              }}
                              onTouchStart={(e) => {
                                if (isMapEditorOpen) {
                                  // Prevents scroll gesture interference during drag
                                  e.preventDefault();
                                  const touch = e.touches[0];
                                  if (touch && e.currentTarget.ownerSVGElement) {
                                    const svg = e.currentTarget.ownerSVGElement;
                                    const rect = svg.getBoundingClientRect();
                                    const clickX = ((touch.clientX - rect.left) / rect.width) * 100;
                                    const clickY = ((touch.clientY - rect.top) / rect.height) * 100;
                                    setDragOffset({
                                      x: clickX - node.x,
                                      y: clickY - node.y
                                    });
                                  } else {
                                    setDragOffset({ x: 0, y: 0 });
                                  }
                                  setDraggedNodeId(node.id);
                                  setSelectedEditorNodeId(node.id);
                                }
                              }}
                              onClick={() => {
                                if (isMapEditorOpen) {
                                  setSelectedEditorNodeId(node.id);
                                } else {
                                  setSelectedMapStop(node.id);
                                  // Also populate navigation selections conveniently
                                  if (node.id === "MANNARKKAD" || node.id === "PALAKKAD" || node.id === "AGALI" || node.id === "MUKKALI") {
                                    setNavSource(node.id);
                                  } else {
                                    setNavDest(node.id);
                                  }
                                  setBusTimingMode("stop");
                                }
                              }}
                              className={`group transition-all duration-150 ${isMapEditorOpen ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
                            >
                              {/* Pulse effect for selected stop */}
                              {isSelectedNode && !isMapEditorOpen && (
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r="4.5"
                                  fill="none"
                                  stroke="#052962"
                                  strokeWidth="0.8"
                                  opacity="0.8"
                                >
                                  <animate
                                    attributeName="r"
                                    values="2.5;7.5;2.5"
                                    dur="2.5s"
                                    repeatCount="indefinite"
                                  />
                                  <animate
                                    attributeName="opacity"
                                    values="0.8;0;0.8"
                                    dur="2.5s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              )}

                              {/* Highlight for Selected Editor node */}
                              {isEditorSelected && (
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r="4.8"
                                  fill="none"
                                  stroke="#f59e0b"
                                  strokeWidth="1.2"
                                  strokeDasharray="1.5 1.5"
                                >
                                  <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from={`0 ${node.x} ${node.y}`}
                                    to={`360 ${node.x} ${node.y}`}
                                    dur="10s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              )}

                              {/* Static graphic point */}
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={isEditorSelected ? "3.2" : isSelectedNode ? "2.5" : "1.8"}
                                fill={isEditorSelected ? "#f59e0b" : isSelectedNode ? "#052962" : "#ffffff"}
                                stroke={isEditorSelected ? "#78350f" : isSelectedNode ? "#ffe500" : "#475569"}
                                strokeWidth={isEditorSelected ? "1.5" : isSelectedNode ? "1" : "0.75"}
                                className="transition-all duration-205 group-hover:scale-135 group-hover:fill-[#ffe500]"
                              />

                              {/* Node Label Text */}
                              <text
                                x={node.x}
                                y={node.y - (isEditorSelected ? 4.5 : 3.2)}
                                textAnchor="middle"
                                fontSize="2.2"
                                fontWeight="bold"
                                fill={isEditorSelected ? "#b45309" : isSelectedNode ? "#052962" : "#334155"}
                                className="font-anek-malayalam select-none"
                              >
                                {lang === "ml" ? node.nameMl : node.nameEn}
                              </text>

                              {/* Direct coordinates tags in Editor mode */}
                              {isMapEditorOpen && (
                                <text
                                  x={node.x}
                                  y={node.y + 3.8}
                                  textAnchor="middle"
                                  fontSize="1.6"
                                  fontWeight="black"
                                  fill="#f59e0b"
                                  className="font-mono select-none"
                                >
                                  {`${node.x},${node.y}`}
                                </text>
                              )}
                            </g>
                          );
                        })}

                      </svg>

                      {/* Floating zoom keys guide */}
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-[9px] px-2 py-1 rounded border border-slate-200 font-bold text-slate-500 shadow-xs flex items-center gap-1.5 leading-none">
                        <span className="w-2 h-2 rounded-full bg-[#ffe500] border border-slate-400 inline-block animate-pulse"></span>
                        സ്റ്റേഷനിൽ ക്ലിക്ക് ചെയ്ത് departures ലഭിക്കാം
                      </div>
                    </div>

                    {/* Quick navigation assist block */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs text-left">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" /> ഗൂഗിൾ റോഡ് മാപ്പ് വിവരം:
                      </span>
                      <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                        അട്ടപ്പാടി ചുരം റോഡ് (SH-136) മണ്ണാർക്കാട് തുടങ്ങി മുക്കാലി (സൈലന്റ് വാലി ജംഗ്ഷൻ) - അഗളി - ആനക്കട്ടി ചുരത്തിലേക്ക് പ്രവേശിക്കുന്നു. അഗളിയിൽ നിന്നും കോയമ്പത്തൂർ റോഡും മറ്റൊന്ന് പുതൂർ വഴി മുത്തു മുള്ളി അതിർത്തിയിലേക്കും പോകുന്നു.
                      </p>
                    </div>

                    {/* Integrated Customization Toggle Button */}
                    {isAdmin && (
                      <div className="pt-2">
                        <button
                          id="map-editor-toggle-btn"
                          onClick={() => setIsMapEditorOpen(!isMapEditorOpen)}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition duration-200 ${
                            isMapEditorOpen
                              ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-900 shadow-md font-extrabold"
                              : "bg-slate-900 hover:bg-slate-800 border-slate-950 text-white shadow-sm hover:shadow"
                          }`}
                        >
                          <Sliders className="w-4 h-4 shrink-0" />
                          {isMapEditorOpen ? "Close Chart & Branching Editor 🔒" : "🛠️ Customize Chart & Branching"}
                        </button>
                      </div>
                    )}

                    {/* Interactive Layout Editor Control Center */}
                    {isAdmin && isMapEditorOpen && (
                      <div className="bg-slate-900 text-slate-100 border border-slate-950 rounded-xl p-4 shadow-xl space-y-4 font-anek-malayalam animate-fade-in mt-4 text-left">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h6 className="text-[11px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1 font-mono">
                            <Sliders className="w-3.5 h-3.5" /> chart layout tuning
                          </h6>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to reset all custom station layings and branches to default? This cannot be undone.")) {
                                  localStorage.removeItem("attappadi_map_nodes2");
                                  localStorage.removeItem("attappadi_map_lines2");
                                  setMapNodes(DEFAULT_MAP_NODES);
                                  setMapLines(DEFAULT_MAP_LINES);
                                  setSelectedEditorNodeId(null);
                                }
                              }}
                              title="Reset Layout & Branching"
                              className="p-1.5 hover:bg-slate-850 rounded text-slate-400 hover:text-rose-400 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Warning/Tips */}
                        <p className="text-[11px] leading-relaxed text-slate-300 font-semibold flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 inline mr-1" /> <span className="font-extrabold text-amber-400">Map Tip:</span> You can click and drag any hub circle directly on the SVG map above to reposition it in real-time!
                        </p>

                        {/* Sub-tabs: Hubs vs Branching vs Export */}
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-extrabold">
                          <button
                            onClick={() => setEditorTab("nodes")}
                            className={`flex-1 py-1 rounded transition text-center ${editorTab === "nodes" ? "bg-amber-500 text-slate-900 font-black" : "text-slate-400 hover:text-slate-100"}`}
                          >
                            📍 Adjust Stations
                          </button>
                          <button
                            onClick={() => setEditorTab("branching")}
                            className={`flex-1 py-1 rounded transition text-center ${editorTab === "branching" ? "bg-amber-500 text-slate-900 font-black" : "text-slate-400 hover:text-slate-100"}`}
                          >
                            🔗 Edit Branching
                          </button>
                          <button
                            onClick={() => setEditorTab("export")}
                            className={`flex-1 py-1 rounded transition text-center ${editorTab === "export" ? "bg-amber-500 text-slate-900 font-black" : "text-slate-400 hover:text-slate-100"}`}
                          >
                            📋 Code Export
                          </button>
                        </div>

                        {/* Tab Content 1: Nodes adjustments */}
                        {editorTab === "nodes" && (
                          <div className="space-y-3.5 text-xs text-left">
                            <div>
                              <label className="block text-[10px] uppercase font-black text-slate-400 mb-1">
                                Select Station Hub to Tweak:
                              </label>
                              <select
                                value={selectedEditorNodeId || ""}
                                onChange={(e) => setSelectedEditorNodeId(e.target.value || null)}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                              >
                                <option value="">-- Choose a Station --</option>
                                {[...mapNodes].sort((a, b) => a.nameEn.localeCompare(b.nameEn)).map(n => (
                                  <option key={n.id} value={n.id}>
                                    {n.nameEn} ({n.nameMl})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Active Station values and sliders */}
                            {selectedEditorNodeId ? (() => {
                              const activeNode = mapNodes.find(n => n.id === selectedEditorNodeId);
                              if (!activeNode) return null;

                              return (
                                <div className="space-y-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 animate-fade-in text-left">
                                  <div className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-800">
                                    <span className="font-extrabold text-[#ffe500] font-mono text-[10px]">ID: {activeNode.id}</span>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to remove the station "${activeNode.nameEn}" and connected line branches?`)) {
                                          const revisedNodes = mapNodes.filter(n => n.id !== activeNode.id);
                                          setMapNodes(revisedNodes);
                                          localStorage.setItem("attappadi_map_nodes2", JSON.stringify(revisedNodes));
                                          
                                          const revisedLines = mapLines.filter(l => l.from !== activeNode.id && l.to !== activeNode.id);
                                          setMapLines(revisedLines);
                                          localStorage.setItem("attappadi_map_lines2", JSON.stringify(revisedLines));
                                          
                                          setSelectedEditorNodeId(null);
                                        }
                                      }}
                                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5"
                                    >
                                      <Trash className="w-3 h-3" /> Delete Station
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-left">
                                    <div>
                                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">English Name:</label>
                                      <input
                                        type="text"
                                        value={activeNode.nameEn}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setMapNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, nameEn: val } : n));
                                          setTimeout(() => {
                                            localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes));
                                          }, 50);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-200 text-xs font-bold"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Malayalam Name:</label>
                                      <input
                                        type="text"
                                        value={activeNode.nameMl}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setMapNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, nameMl: val } : n));
                                          setTimeout(() => {
                                            localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes));
                                          }, 50);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-200 text-xs font-bold font-anek-malayalam"
                                      />
                                    </div>
                                  </div>

                                  {/* Coordinate Slider Inputs */}
                                  <div className="space-y-2 text-left">
                                    <div className="space-y-1">
                                      <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold">
                                        <span>Coordinate X (Horizontal Position)</span>
                                        <span className="text-amber-400 font-black">{activeNode.x}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="1"
                                        max="99"
                                        value={activeNode.x}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          setMapNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, x: val } : n));
                                        }}
                                        onMouseUp={() => localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes))}
                                        onTouchEnd={() => localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes))}
                                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold">
                                        <span>Coordinate Y (Vertical Position)</span>
                                        <span className="text-amber-400 font-black">{activeNode.y}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="1"
                                        max="99"
                                        value={activeNode.y}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value);
                                          setMapNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, y: val } : n));
                                        }}
                                        onMouseUp={() => localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes))}
                                        onTouchEnd={() => localStorage.setItem("attappadi_map_nodes2", JSON.stringify(mapNodes))}
                                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })() : (
                              <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-950/25 rounded border border-slate-850">
                                Click a stop circle on the map above or choose from the dropdown to start adjusting visual positions.
                              </p>
                            )}

                            {/* Section: Create Custom Station */}
                            <div className="border-t border-slate-800 pt-3 mt-1 space-y-2">
                              <span className="font-extrabold text-[10px] uppercase text-slate-300 block">
                                ➕ Add Custom Station
                              </span>
                              <div className="bg-slate-950/30 p-2.5 rounded border border-slate-850 space-y-2">
                                <div className="space-y-1">
                                  <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Unique ID (e.g. THAVALAM_WEST):</label>
                                  <input id="new-hub-id" type="text" placeholder="e.g. PALOOR_EAST" className="w-full bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded text-slate-200 uppercase font-mono" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">English Name:</label>
                                    <input id="new-hub-en" type="text" placeholder="Paloor East" className="w-full bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded text-slate-200" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Malayalam Name:</label>
                                    <input id="new-hub-ml" type="text" placeholder="പാലൂർ കിഴക്ക്" className="w-full bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded text-slate-200 font-anek-malayalam" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">X Percent (1-100):</label>
                                    <input id="new-hub-x" type="number" min="1" max="99" defaultValue="50" className="w-full bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded text-slate-200 font-mono" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="block text-[9px] text-slate-400 font-semibold mb-0.5">Y Percent (1-100):</label>
                                    <input id="new-hub-y" type="number" min="1" max="99" defaultValue="50" className="w-full bg-slate-950 border border-slate-800 text-[11px] px-2 py-1 rounded text-slate-200 font-mono" />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const idInput = document.getElementById("new-hub-id") as HTMLInputElement;
                                    const enInput = document.getElementById("new-hub-en") as HTMLInputElement;
                                    const mlInput = document.getElementById("new-hub-ml") as HTMLInputElement;
                                    const xInput = document.getElementById("new-hub-x") as HTMLInputElement;
                                    const yInput = document.getElementById("new-hub-y") as HTMLInputElement;

                                    const id = idInput?.value.trim().toUpperCase();
                                    const nameEn = enInput?.value.trim();
                                    const nameMl = mlInput?.value.trim();
                                    const xVal = xInput?.value ? parseInt(xInput.value) : 50;
                                    const yVal = yInput?.value ? parseInt(yInput.value) : 50;

                                    if (!id || !nameEn || !nameMl) {
                                      alert("Please fill in all layout fields to create a custom station.");
                                      return;
                                    }
                                    if (mapNodes.some(n => n.id === id)) {
                                      alert("A station with this Unique ID already exists.");
                                      return;
                                    }

                                    const newNode = { id, x: xVal, y: yVal, nameEn, nameMl };
                                    const updated = [...mapNodes, newNode];
                                    setMapNodes(updated);
                                    localStorage.setItem("attappadi_map_nodes2", JSON.stringify(updated));
                                    setSelectedEditorNodeId(id);

                                    // Reset fields
                                    if (idInput) idInput.value = "";
                                    if (enInput) enInput.value = "";
                                    if (mlInput) mlInput.value = "";
                                    if (xInput) xInput.value = "50";
                                    if (yInput) yInput.value = "50";
                                  }}
                                  className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 transition text-[11px] font-bold py-1.5 rounded text-white flex items-center justify-center gap-1.5 shadow"
                                >
                                  <Plus className="w-3.5 h-3.5 shrink-0" /> Save New Station
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content 2: Branch Connections adjustment */}
                        {editorTab === "branching" && (
                          <div className="space-y-3.5 text-xs text-left">
                            <span className="font-extrabold text-[10px] uppercase text-slate-300 block">
                              🔗 Establish Station Connection
                            </span>
                            <div className="bg-slate-950/40 p-2.5 rounded border border-slate-850 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-left">
                                <div>
                                  <label className="block text-[9px] text-slate-400 font-bold mb-0.5">From Station:</label>
                                  <select id="branch-from-select" className="w-full bg-slate-950 border border-slate-800 text-[11px] p-1.5 rounded text-slate-100 font-bold">
                                    <option value="">-- Choose From --</option>
                                    {[...mapNodes].sort((a,b)=>a.nameEn.localeCompare(b.nameEn)).map(n => <option key={n.id} value={n.id}>{n.nameEn}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] text-slate-400 font-bold mb-0.5">To Station:</label>
                                  <select id="branch-to-select" className="w-full bg-slate-950 border border-slate-800 text-[11px] p-1.5 rounded text-slate-100 font-bold">
                                    <option value="">-- Choose To --</option>
                                    {[...mapNodes].sort((a,b)=>a.nameEn.localeCompare(b.nameEn)).map(n => <option key={n.id} value={n.id}>{n.nameEn}</option>)}
                                  </select>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const fromSelect = document.getElementById("branch-from-select") as HTMLSelectElement;
                                  const toSelect = document.getElementById("branch-to-select") as HTMLSelectElement;
                                  const from = fromSelect?.value;
                                  const to = toSelect?.value;

                                  if (!from || !to) {
                                    alert("Please choose both station endpoints to connect.");
                                    return;
                                  }
                                  if (from === to) {
                                    alert("A station cannot link directly to itself.");
                                    return;
                                  }

                                  const exists = mapLines.some(l => 
                                    (l.from === from && l.to === to) || (l.from === to && l.to === from)
                                  );
                                  if (exists) {
                                    alert("This branch connection line already exists!");
                                    return;
                                  }

                                  const updatedLines = [...mapLines, { from, to }];
                                  setMapLines(updatedLines);
                                  localStorage.setItem("attappadi_map_lines2", JSON.stringify(updatedLines));
                                  
                                  if (fromSelect) fromSelect.value = "";
                                  if (toSelect) toSelect.value = "";
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 transition text-[11px] py-1.5 rounded text-white font-extrabold flex items-center justify-center gap-1.5 shadow"
                              >
                                <Link className="w-3.5 h-3.5" /> Establish Connection 🔗
                              </button>
                            </div>

                            {/* List of currently drawn line connections */}
                            <div className="space-y-2 border-t border-slate-800 pt-3">
                              <span className="font-extrabold text-[10px] uppercase text-slate-300 block">
                                Existing Connection Branches ({mapLines.length})
                              </span>
                              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-850 bg-slate-950/20 p-2 rounded">
                                {mapLines.map((line, lIdx) => {
                                  const nameF = mapNodes.find(n => n.id === line.from)?.nameEn || line.from;
                                  const nameT = mapNodes.find(n => n.id === line.to)?.nameEn || line.to;

                                  return (
                                    <div key={lIdx} className="flex justify-between items-center py-1 px-1.5 hover:bg-slate-850/50 border-b border-slate-800/50 text-[11px]">
                                      <span className="font-semibold text-slate-300">
                                        {nameF} <span className="text-amber-500 text-[10px] font-bold px-1">↔</span> {nameT}
                                      </span>
                                      <button
                                        onClick={() => {
                                          const revised = mapLines.filter((_, idx) => idx !== lIdx);
                                          setMapLines(revised);
                                          localStorage.setItem("attappadi_map_lines2", JSON.stringify(revised));
                                        }}
                                        className="text-rose-400 hover:text-rose-300 flex items-center p-1 font-bold"
                                        title="Sever connection"
                                      >
                                        <Trash className="w-3.5 h-3.5 shrink-0" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content 3: Code Export configuration */}
                        {editorTab === "export" && (
                          <div className="space-y-3.5 text-xs text-left">
                            <span className="font-extrabold text-[10px] uppercase text-amber-400 block pb-1 border-b border-slate-850 flex items-center gap-1">
                              📋 Save layout values permanently to code
                            </span>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                              To preserve this visual coordinate chart permanently, copy the generated arrays and paste them into <code className="text-amber-400 font-mono">DEFAULT_MAP_NODES</code> and <code className="text-amber-400 font-mono">DEFAULT_MAP_LINES</code> inside this file!
                            </p>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-[9px] text-slate-300 uppercase font-black">1. COPY MAP STATIONS :</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(mapNodes, null, 2));
                                      setCopiedLink(true);
                                      setTimeout(() => setCopiedLink(false), 2000);
                                    }}
                                    className="text-[9px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                                  >
                                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    {copiedLink ? "Copied Array!" : "Copy Array"}
                                  </button>
                                </div>
                                <textarea
                                  readOnly
                                  value={JSON.stringify(mapNodes, null, 2)}
                                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded text-[9px] px-2 py-1.5 font-mono text-slate-400 cursor-text select-all focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-[9px] text-slate-300 uppercase font-black">2. COPY CONNECTIVITY BRANCHES :</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(mapLines, null, 2));
                                      setCopiedLink(true);
                                      setTimeout(() => setCopiedLink(false), 2000);
                                    }}
                                    className="text-[9px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                                  >
                                    {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    {copiedLink ? "Copied Array!" : "Copy Array"}
                                  </button>
                                </div>
                                <textarea
                                  readOnly
                                  value={JSON.stringify(mapLines, null, 2)}
                                  className="w-full h-24 bg-slate-950 border border-slate-800 rounded text-[9px] px-2 py-1.5 font-mono text-slate-400 cursor-text select-all focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* Left Controls & dynamic schedulers lists */}
                <div className="xl:col-span-7 space-y-5">
                  
                  {/* Mode 1: HUB STATION DEPARTURE SCHEDULES */}
                  {busTimingMode === "stop" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm animate-fade-in">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#052962]/5 text-[#052962] font-black px-2 py-0.5 rounded tracking-wide uppercase font-anek-malayalam">
                          HUB STATION SELECTOR
                        </span>
                        <h4 className="font-black text-[#052962] text-xl leading-snug">
                          സ്റ്റേഷൻ പ്രകാരമുള്ള സമയവിവരങ്ങൾ
                        </h4>
                      </div>

                      {/* Selector grid or list */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          താഴെ നൽകിയതിൽ നിന്നും സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക:
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 select-none">
                          {stopChoices.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => setSelectedMapStop(st.id)}
                              className={`p-2 rounded-lg text-xs font-black transition text-center font-anek-malayalam cursor-pointer border ${
                                selectedMapStop === st.id
                                  ? "bg-[#052962] text-white border-[#052962] shadow-xs"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {lang === "ml" ? st.ml : st.en}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display results */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 pt-2 border-slate-100">
                          <h5 className="font-bold text-[#052962] text-xs leading-none flex items-center gap-1">
                            <span>🕒 Departures from:</span>
                            <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded text-[11px] font-black font-anek-malayalam">
                              {currentMapStopEntity.ml} ( {currentMapStopEntity.en} )
                            </span>
                          </h5>
                          <span className="text-[10.5px] font-black text-slate-400">
                            {stopDepartures.length} ട്രിപ്പുകൾ കണ്ടെത്തി
                          </span>
                        </div>

                        {stopDepartures.length > 0 ? (
                          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                            {stopDepartures.map((item, idx) => {
                              const isKsrtc = item.typeLabel === "KSRTC";
                              const isTnstc = item.typeLabel === "TNSTC";
                              const badgeClass = 
                                isKsrtc 
                                  ? "bg-blue-50 text-blue-800 border-blue-200" 
                                  : isTnstc 
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200";

                              return (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={`${item.routeId}-${idx}`} 
                                  className="p-3.5 border border-slate-155 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition duration-150 block space-y-2.5"
                                >
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="space-y-0.5">
                                      <h6 className="font-extrabold text-slate-800 text-[14px] leading-tight">
                                        {lang === "ml" ? item.routeMl : item.routeEn}
                                      </h6>
                                      <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">
                                        {lang === "ml" ? item.busTypeMl : item.busTypeEn}
                                      </p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase ${badgeClass}`}>
                                      {item.typeLabel === "PRIVATE" && item.privateBusName ? item.privateBusName : item.typeLabel}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-150">
                                    <div className="text-[11px]">
                                      <span className="text-slate-400 font-bold block text-[9px] uppercase leading-none">DESTINATION TIMING</span>
                                      <span className="font-extrabold text-[#052962]">
                                        Heading directly to: <strong className="text-red-700">{lang === "ml" ? item.headingToMl : item.headingToEn.toUpperCase()}</strong>
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-slate-400 font-bold block text-[9px] uppercase leading-none">TIME AT STATION</span>
                                      <span className="text-sm font-black text-[#052962] bg-[#052962]/5 border border-[#052962]/10 px-2.5 py-0.5 rounded inline-block select-all">
                                        {item.time}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Line stops sequence map timeline snippet */}
                                  <div className="flex items-center gap-1 py-1 overflow-x-auto text-[9.5px] font-bold text-slate-400 font-anek-malayalam whitespace-nowrap">
                                    {item.fullList.map((stopItem, sIdx) => {
                                      const isSelf = normalizeStopName(stopItem.typeEn) === normalizeStopName(selectedMapStop);
                                      return (
                                        <div key={sIdx} className="flex items-center gap-1 shrink-0 last:mr-0 mr-1.5">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${isSelf ? "bg-[#052962] text-white font-black" : "bg-slate-200 text-slate-600 font-medium"}`}>
                                            {stopItem.time} {lang === "ml" ? stopItem.typeMl : stopItem.typeEn.toUpperCase()}
                                          </span>
                                          {sIdx < item.fullList.length - 1 && <span className="text-slate-300">→</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-lg">
                            <Bus className="w-8 h-8 text-slate-300 mx-auto animate-bounce" />
                            <p className="text-xs text-slate-400 font-medium font-anek-malayalam">
                              ഈ സ്റ്റേഷനിൽ പ്രധാന സമയ സർവീസുകളൊന്നും നിശ്ചയിച്ചിട്ടില്ല. മറ്റൊരു സ്റ്റേഷൻ നോക്കൂ.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Mode 2: TRANSIT ROUTING DIRECTIONS FINDER */}
                  {busTimingMode === "directions" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm animate-fade-in">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#052962]/5 text-[#052962] font-black px-2 py-0.5 rounded tracking-wide uppercase font-anek-malayalam">
                          TRANSIT ROUTING
                        </span>
                        <h4 className="font-black text-[#052962] text-xl leading-snug font-anek-malayalam">
                          കണക്റ്റിങ് സർവീസ് റൂട്ട് കണ്ടെത്തുക
                        </h4>
                      </div>

                      {/* Map Router Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-500 block">
                            ആരംഭിക്കുന്ന സ്റ്റേഷൻ (Starting Hub):
                          </label>
                          <select
                            value={navSource}
                            onChange={(e) => setNavSource(e.target.value)}
                            className="w-full border rounded-lg p-2.5 bg-slate-50 text-xs font-black cursor-pointer"
                          >
                            {stopChoices.map(sc => (
                              <option key={sc.id} value={sc.id}>
                                {lang === "ml" ? sc.ml : sc.en.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-extrabold text-slate-500 block">
                            ചേരേണ്ട ലക്ഷ്യസ്ഥാനം (Destination):
                          </label>
                          <select
                            value={navDest}
                            onChange={(e) => setNavDest(e.target.value)}
                            className="w-full border rounded-lg p-2.5 bg-slate-50 text-xs font-black cursor-pointer"
                          >
                            {stopChoices.map(sc => (
                              <option key={sc.id} value={sc.id}>
                                {lang === "ml" ? sc.ml : sc.en.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Display Directions results */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                          <h5 className="font-bold text-[#052962] text-xs leading-none">
                            🧭 Available Bus Trips:
                          </h5>
                          <span className="text-[10.5px] font-black text-slate-400">
                            {directionsResults.length} കൺഫേം സർവീസുകൾ
                          </span>
                        </div>

                        {directionsResults.length > 0 ? (
                          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {directionsResults.map((item, idx) => {
                              const isKsrtc = item.typeLabel === "KSRTC";
                              const isTnstc = item.typeLabel === "TNSTC";
                              const badgeClass = 
                                isKsrtc 
                                  ? "bg-blue-50 text-blue-800 border-blue-200" 
                                  : isTnstc 
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-250";

                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  key={`${item.routeId}-${idx}`}
                                  className="p-3.5 border border-slate-150 rounded-xl bg-slate-50/70 space-y-2.5"
                                >
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <h6 className="font-extrabold text-slate-800 text-[13.5px]">
                                        {lang === "ml" ? item.routeMl : item.routeEn}
                                      </h6>
                                      <p className="text-[10.5px] text-slate-400 font-bold uppercase">
                                        {lang === "ml" ? item.busTypeMl : item.busTypeEn}
                                      </p>
                                    </div>
                                    <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md border ${badgeClass}`}>
                                      {item.typeLabel === "PRIVATE" && item.privateBusName ? item.privateBusName : item.typeLabel}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-150 relative overflow-hidden">
                                    <div className="border-r border-slate-100 pr-1 select-all">
                                      <span className="text-[8.5px] font-bold text-slate-400 block uppercase">START TIME</span>
                                      <span className="text-slate-800 text-xs font-black block font-anek-malayalam">
                                        {lang === "ml" ? stopChoices.find(sc => sc.id === navSource)?.ml : navSource}
                                      </span>
                                      <span className="text-[14px] font-black text-[#052962] mt-0.5 inline-block">
                                        {item.depTime}
                                      </span>
                                    </div>
                                    <div className="pl-1 select-all">
                                      <span className="text-[8.5px] font-bold text-slate-400 block uppercase">ARRIVAL TIME</span>
                                      <span className="text-slate-800 text-xs font-black block font-anek-malayalam">
                                        {lang === "ml" ? stopChoices.find(sc => sc.id === navDest)?.ml : navDest}
                                      </span>
                                      <span className="text-[14px] font-black text-red-700 mt-0.5 inline-block">
                                        {item.arrTime}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Stops Timeline path */}
                                  <div className="flex items-center gap-1 overflow-x-auto text-[9px] font-bold text-slate-400 font-anek-malayalam whitespace-nowrap pt-1">
                                    {item.fullList.map((stopItem, sIdx) => {
                                      const isSrc = normalizeStopName(stopItem.typeEn) === normalizeStopName(navSource);
                                      const isDst = normalizeStopName(stopItem.typeEn) === normalizeStopName(navDest);
                                      return (
                                        <div key={sIdx} className="flex items-center gap-1 shrink-0">
                                          <span className={`px-1.5 py-0.5 rounded ${
                                            isSrc 
                                              ? "bg-[#052962] text-white font-black" 
                                              : isDst 
                                                ? "bg-red-700 text-white font-black animate-pulse" 
                                                : "bg-slate-150 text-slate-650"
                                          }`}>
                                            {stopItem.time} {lang === "ml" ? stopItem.typeMl : stopItem.typeEn.toUpperCase()}
                                          </span>
                                          {sIdx < item.fullList.length - 1 && <span className="text-slate-300">→</span>}
                                        </div>
                                      );
                                    })}
                                  </div>

                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-14 text-center space-y-2.5 border border-dashed border-slate-200 rounded-lg">
                            <Bus className="w-8 h-8 text-slate-300 mx-auto" />
                            <div className="space-y-1">
                              <p className="text-xs text-slate-700 font-extrabold font-anek-malayalam">
                                നേരിട്ടുള്ള സർവീസുകളൊന്നും കണ്ടെത്തിയിട്ടില്ല
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium max-w-sm mx-auto font-anek-malayalam">
                                ആരംഭവഴിയും ചേരേണ്ട ലക്ഷ്യസ്ഥാനവും മാറ്റി പരീക്ഷിക്കുക. ഉദാഹരണത്തിന് 'മണ്ണാർക്കാട്' മുതൽ 'ആനക്കട്ടി' അല്ലെങ്കിൽ 'പാലക്കാട് - അഗളി'.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Mode 3: SIGHTSEEING SIGHTS BUS ASSISTANT */}
                  {busTimingMode === "assist" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm animate-fade-in font-anek-malayalam">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#052962]/5 text-[#052962] font-black px-2 py-0.5 rounded tracking-wide uppercase font-anek-malayalam">
                          SIGHTSEEING DEPARTURES
                        </span>
                        <h4 className="font-black text-[#052962] text-xl leading-snug font-anek-malayalam">
                          ടൂറിസ്റ്റ് കേന്ദ്രങ്ങളും സമീപത്തുള്ള ബസ് സ്റ്റോപ്പും
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          കണ്ടെത്തേണ്ട ടൂറിസ്റ്റ് കേന്ദ്രം തിരഞ്ഞെടുക്കുക (Sightseeing Spot):
                        </label>
                        <div className="flex flex-col gap-2">
                          {assistHotspots.map((ah) => (
                            <button
                              key={ah.id}
                              onClick={() => {
                                setSelectedAssistPlace(ah.id);
                                setSelectedMapStop(ah.nearestStop);
                              }}
                              className={`p-3 rounded-lg text-left text-xs transition border flex items-center justify-between cursor-pointer ${
                                selectedAssistPlace === ah.id
                                  ? "bg-[#052962]/5 text-[#052962] border-[#052962] font-extrabold"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <span className="font-anek-malayalam flex items-center gap-1.5">
                                🌲 {lang === "ml" ? ah.nameMl : ah.nameEn}
                              </span>
                              <span className="bg-white px-2 py-0.5 text-[10px] rounded border border-slate-200 text-slate-400 font-bold">
                                {lang === "ml" ? "അടുത്ത സ്റ്റോപ്പ്: " : "Stop: "} {ah.nearestStop}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Info and timing board for selected hotspot */}
                      <div className="bg-[#ffe500]/5 border border-[#ffe500]/40 p-4 rounded-xl space-y-3 mt-4">
                        <div className="flex items-center gap-2 border-b border-[#ffe500]/30 pb-2">
                          <MapPin className="w-5 h-5 text-red-700" />
                          <div>
                            <h5 className="font-extrabold text-[#052962] text-[14px]">
                              {lang === "ml" ? activeSpot.nameMl : activeSpot.nameEn}
                            </h5>
                            <p className="text-[11px] font-bold text-slate-500 font-anek-malayalam flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" /> {lang === "ml" ? `അടുത്തുള്ള സ്റ്റോപ്പ്: ${stopChoices.find(sc => sc.id === activeSpot.nearestStop)?.ml} (${activeSpot.distanceMl})` : `Nearest Bus Stop: ${activeSpot.nearestStop} (${activeSpot.distanceEn})`}
                            </p>
                          </div>
                        </div>

                        <div className="text-[11.5px] text-slate-700 font-semibold leading-relaxed font-anek-malayalam">
                          <span className="font-extrabold text-red-800 flex items-center gap-1 text-xs mb-0.5">
                            <Info className="w-3.5 h-3.5 text-red-700 shrink-0" />
                            {lang === "ml" ? "എങ്ങനെ എത്തിച്ചേരാം (Transit Tip):" : "Transit Tip:"}
                          </span>
                          {lang === "ml" ? activeSpot.guideMl : activeSpot.guideEn}
                        </div>
                      </div>

                      {/* Display schedules arriving at this nearest point */}
                      <div className="space-y-3 pt-2">
                        <h6 className="font-extrabold text-xs text-[#052962] border-b pb-2">
                          🚌 '{stopChoices.find(sc => sc.id === activeSpot.nearestStop)?.ml}' വഴിയുള്ള കോൺടാക്റ്റ് ബസുകൾ:
                        </h6>
                        
                        {spotDepartures.length > 0 ? (
                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {spotDepartures.map((item, idx) => (
                              <div key={`${item.routeId}-${idx}`} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs font-anek-malayalam">
                                <div className="space-y-0.5 truncate flex-1">
                                  <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.2 rounded font-extrabold">
                                    {item.typeLabel === "PRIVATE" && item.privateBusName ? item.privateBusName : item.typeLabel}
                                  </span>
                                  <h6 className="font-extrabold text-slate-800 pt-0.5">{lang === "ml" ? item.routeMl : item.routeEn}</h6>
                                  <p className="text-[9.5px] text-slate-400 font-bold">{lang === "ml" ? item.busTypeMl : item.busTypeEn}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase font-sans">ARRIVING TIME</span>
                                  <span className="font-black text-[#052962] bg-[#052962]/5 px-2 py-0.5 rounded select-all font-sans">
                                    {item.time}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center font-medium font-anek-malayalam">No schedules match this location.</p>
                        )}
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
}
