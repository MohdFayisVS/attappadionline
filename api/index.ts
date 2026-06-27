import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, getDoc, setLogLevel } from "firebase/firestore";

// Suppress benign gRPC idle connection and stream termination warnings in Node environment
setLogLevel("error");

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// URL Rewrite Middleware for Vercel Serverless routing compat
app.use((req, res, next) => {
  if (process.env.VERCEL && req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + req.url;
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let DB_PATH = path.join(__dirname, "db.json");
if (process.env.VERCEL) {
  DB_PATH = path.join("/tmp", "db.json");
}

// ==================== DEFAULT SEED ARRAYS ====================
const defaultDestinations = [
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

const defaultCultures = [
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

const defaultStays = [
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

const defaultTravelogues = [
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

const defaultPhotos = [
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
    descMl: "సైలന്റ് വാലിയുടെ അതിർത്തി വനങ്ങളിൽ സഞ്ചാരികൾക്കായി ഒരുക്കിയ സുന്ദരമായ കാട്ടുപാത."
  }
];

const defaultBusRoutes = [
  {
    id: "bus_1",
    routeEn: "Mannarkkad - Mukkali - Agali - Anaikatty",
    routeMl: "മണ്ണാർക്കാട് - മുക്കാലി - അഗളി - ആനക്കട്ടി",
    type: "KSRTC",
    busTypeEn: "Fast Passenger / Ordinary Local Connections",
    busTypeMl: "ഫാസ്റ്റ് പാസഞ്ചർ / ഓർഡിനറി സർവീസുകൾ",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Every 45 minutes",
    frequencyMl: "ഓരോ 45 മിനിറ്റിലും സർവീസ്",
    timingsEn: "First Bus: 05:30 AM, Last Bus: 08:30 PM",
    timingsMl: "ആദ്യ ബസ്: 05:30 AM, അവസാന ബസ്: 08:30 PM",
    list: [
      { time: "05:30 AM", typeEn: "KSRTC Ordinary", typeMl: "KSRTC ഓർഡിനറി", viaCodeEn: "Mukkali, Agali", viaCodeMl: "മുക്കാലി, അഗളി വഴി" },
      { time: "06:15 AM", typeEn: "KSRTC FP", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ", viaCodeEn: "Mukkali, Agali, Anaikatty", viaCodeMl: "മുക്കാലി, അഗളി, ആനക്കട്ടി വഴി" },
      { time: "07:00 AM", typeEn: "Private Stage Carrier", typeMl: "സ്വകാര്യ ബസ്", viaCodeEn: "Mukkali, Agali, Kottathara", viaCodeMl: "മുക്കാലി, അഗളി, കോട്ടത്തറ വഴി" },
      { time: "08:15 AM", typeEn: "KSRTC Ordinary", typeMl: "KSRTC ഓർഡിനറി", viaCodeEn: "Ittiyadi, Agali", viaCodeMl: "ഇറ്റിയാടി, അഗളി വഴി" },
      { time: "09:30 AM", typeEn: "KSRTC FP", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ", viaCodeEn: "Mukkali, Agali, Anaikatty", viaCodeMl: "മുക്കാലി, അഗളി, ആനക്കട്ടി വഴി" },
      { time: "11:15 AM", typeEn: "Private Stage Carrier", typeMl: "സ്വകാര്യ ബസ്", viaCodeEn: "Goolikadavu, Agali", viaCodeMl: "കൂളിക്കടവ്, അഗളി വഴി" },
      { time: "12:45 PM", typeEn: "KSRTC Ordinary", typeMl: "KSRTC ഓർഡിനറി", viaCodeEn: "Mukkali, Agali", viaCodeMl: "മുക്കാലി, അഗളി വഴി" },
      { time: "02:00 PM", typeEn: "KSRTC FP", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ", viaCodeEn: "Mukkali, Agali, Anaikatty", viaCodeMl: "മുക്കാലി, അഗളി, ആനക്കട്ടി വഴി" },
      { time: "03:30 PM", typeEn: "Private Stage Carrier", typeMl: "സ്വകാര്യ ബസ്", viaCodeEn: "Mukkali, Agali, Sholayur", viaCodeMl: "മുക്കാലി, അഗളി, ഷോളയൂർ വഴി" },
      { time: "04:45 PM", typeEn: "KSRTC Ordinary", typeMl: "KSRTC ഓർഡിനറി", viaCodeEn: "Mukkali, Agali", viaCodeMl: "മുക്കാലി, അഗളി വഴി" },
      { time: "05:55 PM", typeEn: "KSRTC FP", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ", viaCodeEn: "Mukkali, Agali, Anaikatty", viaCodeMl: "മുക്കാലി, അഗളി, ആനക്കട്ടി വഴി" },
      { time: "07:15 PM", typeEn: "Private Stage Carrier", typeMl: "സ്വകാര്യ ബസ്", viaCodeEn: "Mukkali, Agali", viaCodeMl: "മുക്കാലി, അഗളി വഴി" },
      { time: "08:30 PM", typeEn: "KSRTC Ordinary (Night Stay)", typeMl: "KSRTC രാത്രി സർവീസ് (താലൂക്ക് ആശുപത്രി വഴി)", viaCodeEn: "Mukkali, Agali Stay", viaCodeMl: "മുക്കാലി, അഗളി (രാത്രി താമസം)" }
    ]
  },
  {
    id: "bus_2",
    routeEn: "Coimbatore - Anaikatty - Agali",
    routeMl: "കോയമ്പത്തൂർ (ഗാന്ധിപുരം) - ആനക്കട്ടി - അഗളി",
    type: "TNSTC",
    busTypeEn: "Interstate Ordinary / Express Coach",
    busTypeMl: "അന്തർസംസ്ഥാന തമിഴ്നാട് സർവ്വീസ്",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Every 30-40 minutes",
    frequencyMl: "ഓരോ 30-40 മിനിറ്റിലും സർവീസ്",
    timingsEn: "Border shuttle service with TNSTC connection",
    timingsMl: "ആനക്കട്ടി അതിർത്തിയിൽ നിന്ന് കോയമ്പത്തൂരിലേക്ക് നിരന്തര സർവീസുകൾ ലഭ്യമാണ്",
    list: [
      { time: "06:00 AM", typeEn: "TNSTC Ordinary", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്", viaCodeEn: "Thadagam Road, Kanuvai", viaCodeMl: "തടാകം റോഡ്, കണുവായി വഴി" },
      { time: "07:15 AM", typeEn: "TNSTC Ordinary", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്", viaCodeEn: "Thadagam Road, Anaikatty", viaCodeMl: "തടാകം റോഡ്, ആനക്കട്ടി വഴി" },
      { time: "08:30 AM", typeEn: "Private Interstate Bus", typeMl: "സ്വകാര്യ ബസ് സർവീസ്", viaCodeEn: "Gandhipuram, Kanuvai", viaCodeMl: "ഗാന്ധിപുരം, കണുവായി വഴി" },
      { time: "10:00 AM", typeEn: "TNSTC Ordinary", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്", viaCodeEn: "Thadagam Road", viaCodeMl: "തടാകം റോഡ് വഴി" },
      { time: "11:45 AM", typeEn: "TNSTC Express", typeMl: "തമിഴ്‌നാട് എക്സ്പ്രസ്സ്", viaCodeEn: "Coimbatore Town Hall, Anaikatty", viaCodeMl: "കോയമ്പത്തൂർ ടൗൺ ഹാൾ വഴി" },
      { time: "01:15 PM", typeEn: "Private Stage Carrier", typeMl: "സ്വകാര്യ ബസ്", viaCodeEn: "Gandhipuram, Anaikatty", viaCodeMl: "ഗാന്ധിപുരം, ആനക്കട്ടി വഴി" },
      { time: "02:45 PM", typeEn: "TNSTC Ordinary", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്", viaCodeEn: "Thadagam Road", viaCodeMl: "തടാകം റോഡ് വഴി" },
      { time: "04:15 PM", typeEn: "TNSTC Express", typeMl: "തമിഴ്‌നാട് എക്സ്പ്രസ്സ്", viaCodeEn: "Coimbatore Gandhipuram", viaCodeMl: "കോയമ്പത്തൂർ ഗാന്ധിപുരം വഴി" },
      { time: "05:30 PM", typeEn: "Private Town Bus", typeMl: "സ്വകാര്യ നഗര ബസ്", viaCodeEn: "Thadagam Road", viaCodeMl: "തടാകം റോഡ് വഴി" },
      { time: "06:45 PM", typeEn: "TNSTC Ordinary", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ്", viaCodeEn: "Anaikatty Gate", viaCodeMl: "ആനക്കട്ടി ഗേറ്റ് വഴി" },
      { time: "08:15 PM", typeEn: "TNSTC Ordinary (Last Transit)", typeMl: "തമിഴ്‌നാട് സർക്കാർ ബസ് (അവസാന ട്രാൻസിറ്റ്)", viaCodeEn: "Thadagam Road", viaCodeMl: "തടാകം റോഡ് വഴി" }
    ]
  },
  {
    id: "bus_3",
    routeEn: "Agali - Sholayur - Anaikatty",
    routeMl: "അഗളി - ഷോളയൂർ - ആനക്കട്ടി (മേഖലാ സർവീസ്)",
    type: "PRIVATE",
    busTypeEn: "Valley Ordinary Stage Carrier",
    busTypeMl: "വാലി ഓർഡിനറി പ്രൈവറ്റ് ബസ്",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Every 1 hour",
    frequencyMl: "ഓരോ 1 മണിക്കൂർ ഇടവിട്ട് സർവീസ്",
    timingsEn: "First Bus: 06:45 AM, Last Bus: 07:30 PM",
    timingsMl: "ആദ്യ ബസ്: 06:45 AM, അവസാന ബസ്: 07:30 PM",
    list: [
      { time: "06:45 AM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "07:50 AM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Kottathara, Sholayur", viaCodeMl: "കോട്ടത്തറ, ഷോളയൂർ വഴി" },
      { time: "09:00 AM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "10:30 AM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "12:00 PM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Kottathara, Sholayur", viaCodeMl: "കോട്ടത്തറ, ഷോളയൂർ വഴി" },
      { time: "01:30 PM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "03:00 PM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "04:30 PM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Kottathara, Sholayur", viaCodeMl: "കോട്ടത്തറ, ഷോളയൂർ വഴി" },
      { time: "06:00 PM", typeEn: "Private Ordinary", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ്", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" },
      { time: "07:30 PM", typeEn: "Private Ordinary (Last Bus)", typeMl: "സ്വകാര്യ ഓർഡിനറി ബസ് (അവസാന സർവീസ്)", viaCodeEn: "Goolikadavu, Sholayur", viaCodeMl: "കൂളിക്കടവ്, ഷോളയൂർ വഴി" }
    ]
  },
  {
    id: "bus_4",
    routeEn: "Agali - Pudur - Mulli",
    routeMl: "അഗളി - പുതൂർ - മുള്ളി (വനമേഖലാ തനി നാടൻ പാത)",
    type: "KSRTC",
    busTypeEn: "Hill Forest Ordinary Route",
    busTypeMl: "മലയോര ഫോറസ്റ്റ് സർവീസ്",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Limited Services (3 times/day)",
    frequencyMl: "പ്രതിദിനം 3 സർവീസുകൾ (രണ്ടു ദിശകളിലേക്കും)",
    timingsEn: "Essential lifeline for tribal hamlets & Mulli Checkpost Connection",
    timingsMl: "മുള്ളി ഫോറസ്റ്റ് ചെക്ക്പോസ്റ്റും പുതൂർ പഞ്ചായത്തിലെ ആദിവാസി ഊരുകളും ബന്ധിപ്പിക്കുന്ന അത്യാവശ്യ വണ്ടി",
    list: [
      { time: "07:05 AM", typeEn: "KSRTC Ordinary (Up)", typeMl: "KSRTC ഓർഡിനറി - ഹിൽ റൂട്ട്", viaCodeEn: "Kottathara, Pudur", viaCodeMl: "കോട്ടത്തറ, പുതൂർ വഴി" },
      { time: "08:30 AM", typeEn: "KSRTC Ordinary (Down)", typeMl: "KSRTC മടക്ക സർവീസ്", viaCodeEn: "Mulli to Agali", viaCodeMl: "മുള്ളിയിൽ നിന്ന് അഗളിയിലേക്ക്" },
      { time: "12:45 PM", typeEn: "KSRTC Ordinary (Up)", typeMl: "KSRTC ഉച്ച സർവീസ്", viaCodeEn: "Kottathara, Pudur, Mulli", viaCodeMl: "കോട്ടത്തറ, പുതൂർ, മുള്ളി വഴി" },
      { time: "02:15 PM", typeEn: "KSRTC Ordinary (Down)", typeMl: "KSRTC മടക്ക സർവീസ്", viaCodeEn: "Mulli to Agali", viaCodeMl: "മുള്ളിയിൽ നിന്ന് അഗളിയിലേക്ക്" },
      { time: "05:00 PM", typeEn: "KSRTC Ordinary (Up - Night Stay)", typeMl: "KSRTC വൈകുന്നേരത്തെ ആശ്രയം (ഊരുകളിലേക്കുള്ള തിരിച്ചുപോക്ക്)", viaCodeEn: "Pudur, Mulli (Pudur Night Stay)", viaCodeMl: "പുതൂർ, മുള്ളി വഴി (പുതൂരിൽ രാത്രി താമസം)" }
    ]
  },
  {
    id: "bus_5",
    routeEn: "Palakkad - Mannarkkad - Agali - Anaikatty",
    routeMl: "പാലക്കാട് - മണ്ണാർക്കാട് - അഗളി - ആനക്കട്ടി",
    type: "KSRTC",
    busTypeEn: "Fast Passenger / Town Connection Bus",
    busTypeMl: "ഫാസ്റ്റ് പാസഞ്ചർ / ലിങ്ക് സർവീസ്",
    runsEn: "Daily Line",
    runsMl: "എല്ലാ ദിവസവും",
    frequencyEn: "Regular Scheduled Interval",
    frequencyMl: "കൃത്യമായ സമയക്രമങ്ങളിൽ സർവീസ്",
    timingsEn: "Palakkad District HQ Direct Connection",
    timingsMl: "പാലക്കാട് ജില്ലാ ആസ്ഥാനത്തേക്ക് നേരിട്ടുള്ള മികച്ച കണക്റ്റിവിറ്റി",
    list: [
      { time: "05:05 AM", typeEn: "KSRTC Fast Passenger", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ (ആനക്കട്ടി ആദ്യം)", viaCodeEn: "Mannarkkad, Kanjikode, Palakkad Depot", viaCodeMl: "മണ്ണാർക്കാട്, പാലക്കാട് ഡിപ്പോ വഴി" },
      { time: "08:15 AM", typeEn: "KSRTC Ordinary", typeMl: "KSRTC ഓർഡിനറി സർവീസ്", viaCodeEn: "Thavalam, Mannarkkad, Palakkad", viaCodeMl: "താവളം, മണ്ണാർക്കാട്, പാലക്കാട് വഴി" },
      { time: "11:45 AM", typeEn: "KSRTC Fast Passenger", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ", viaCodeEn: "Chirakkal, Mannarkkad", viaCodeMl: "ചിറക്കൽ, മണ്ണാർക്കാട് വഴി" },
      { time: "02:20 PM", typeEn: "KSRTC Fast Passenger", typeMl: "KSRTC ഫാസ്റ്റ് പാസഞ്ചർ (Palakkad Return)", viaCodeEn: "Mannarkkad, Palakkad Hub", viaCodeMl: "മണ്ണാർക്കാട്, പാലക്കാട് ഹബ് വഴി" },
      { time: "04:30 PM", typeEn: "KSRTC Fast Passenger (Last Link)", typeMl: "KSRTC പാസഞ്ചർ (അവസാന ലിങ്ക് ബസ്)", viaCodeEn: "Mannarkkad Town, Palakkad Depot", viaCodeMl: "മണ്ണാർക്കാട് ടൗൺ, പാലക്കാട് ഡിപ്പോ വഴി" }
    ]
  }
];

const defaultEmergencies = [
  {
    id: "em1",
    nameEn: "Tribal Specialty Hospital Ambulance Desk",
    nameMl: "ട്രൈബൽ ആശുപത്രി കോട്ടത്തറ ആംബുലൻസ് ഹെൽപ്പ് ലൈൻ",
    number: "04924-254108",
    type: "ambulance"
  },
  {
    id: "em2",
    nameEn: "Agali Police Patrol Unit Line",
    nameMl: "അഗളി പോലീസ് പട്രോളിങ് വിഭാഗം",
    number: "112 / 94979 80628",
    type: "police"
  },
  {
    id: "em3",
    nameEn: "Agali Forest Range Rescue Operations Office",
    nameMl: "അഗളി ഫോറസ്റ്റ് റെയിഞ്ച് റെസ്ക്യൂ കാര്യാലയം",
    number: "04924-254222",
    type: "forest"
  },
  {
    id: "em4",
    nameEn: "Mana Fire & Safety Control Station",
    nameMl: "അഗ്നിശമന വിഭാഗം അടിയന്തര ഫോൺ",
    number: "04924-254911",
    type: "fire"
  }
];

const defaultNotices = [
  {
    id: "not_1",
    titleEn: "Caution: Wild Elephant Crossing near Mukkali",
    titleMl: "ജാഗ്രതാ നിർദ്ദേശം: മുക്കാലിയിൽ കാട്ടാന സാന്നിധ്യം",
    contentEn: "Frequent wild elephant movements have been reported along the Mukkali-Anakkal forest route. Public is advised to avoid travel from 6 PM to 6 AM and drive slowly.",
    contentMl: "മുക്കാലി-ആനക്കൽ വനപാതയിൽ കാട്ടാനകളുടെ സാന്നിധ്യം ഉള്ളതായി റിപ്പോർട്ട് ചെയ്തിരിക്കുന്നു. വൈകിട്ട് 6 മുതൽ രാവിലെ 6 വരെയുള്ള യാത്രകൾ പരമാവധി ഒഴിവാക്കുക.",
    type: "caution",
    severity: "high",
    date: "2026-06-20",
    active: true
  },
  {
    id: "not_2",
    titleEn: "Landslide Warning: Heavy Rain Alert",
    titleMl: "മഴ മുന്നറിയിപ്പ്: ഉരുൾപൊട്ടൽ ജാഗ്രത",
    contentEn: "With heavy rains continuing in Attappadi hills, flash flood and landslide warnings are in place for Sholayur and Pudur hillsides. Keep emergency numbers standby.",
    contentMl: "അട്ടപ്പാടി മലനിരകളിൽ മഴ തുടരുന്നതിനാൽ ഷോളയൂർ, പുതൂർ മേഖലകളിൽ ഉരുൾപൊട്ടൽ ജാഗ്രതാ നിർദ്ദേശം നൽകിയിരിക്കുന്നു. അടിയന്തര ഹെൽപ്‌ലൈനുകൾ ബന്ധപ്പെടാൻ സൂക്ഷിക്കുക.",
    type: "caution",
    severity: "high",
    date: "2026-06-19",
    active: true
  },
  {
    id: "not_3",
    titleEn: "Free Tribal Health Screening Camp",
    titleMl: "സൗജന്യ മെഡിക്കൽ ക്യാമ്പ് അഗളിയിൽ",
    contentEn: "A comprehensive free health screening and wellness checkup camp will be held at Agali Community Hall on June 25th from 9 AM. Free medicines will be distributed.",
    contentMl: "അഗളി കമ്മ്യൂണിറ്റി ഹാളിൽ ജൂൺ 25-ന് രാവിലെ 9 മണി മുതൽ സൗജന്യ മെഡിക്കൽ ക്യാമ്പ് സംഘടിപ്പിക്കുന്നു. സൗജന്യ മരുന്നുകളും പരിശോധനകളും ലഭ്യമാണ്.",
    type: "notice",
    severity: "medium",
    date: "2026-06-18",
    active: true
  }
];

const defaultLpgDeliveries = [
  {
    id: "lpg_1",
    agencyNameEn: "Matha Indane Gas Agency (Agali)",
    agencyNameMl: "മാതാ ഇൻഡെയ്ൻ ഗ്യാസ് ഏജൻസി (അഗളി)",
    areasEn: "Agali, Kallamala, Mukkali, Goolikkadavu, Pudur, Sholayur, Silent Valley road, and areas across Attappadi",
    areasMl: "അഗളി, കള്ളമല, മുക്കാലി, ഗൂളിക്കടവ്, പുതൂർ, ഷോളയൂർ, സൈലന്റ് വാലി റോഡ്, അട്ടപ്പാടിയിലുടനീളമുള്ള പ്രദേശങ്ങൾ",
    date: "Saturday, 20 June",
    statusEn: "Delivering Today",
    statusMl: "ഇന്ന് വിതരണമുണ്ട്",
    contact: "04924254254",
    notesEn: "Sole authorized distributor for the Attappadi region.",
    notesMl: "അട്ടപ്പാടി മേഖലയിലെ ഏക അംഗീകൃത വിതരണക്കാർ."
  }
];

const defaultAdConfig = {
  leftAd: {
    titleEn: "Contact for Ads",
    titleMl: "പരസ്യങ്ങൾക്ക് ബന്ധപ്പെടുക",
    subtitleEn: "Enquire Now",
    subtitleMl: "വിശദവിവരങ്ങൾക്ക്",
    contact: "+91 9447471224",
    actionType: "share",
    externalUrl: "",
    image: ""
  },
  rightAd: {
    titleEn: "Attappadi Online Ads",
    titleMl: "പരസ്യങ്ങൾക്ക് വിളിക്കുക",
    subtitleEn: "Contact: +91 9447471224",
    subtitleMl: "ബന്ധപ്പെടുക: +91 9447471224",
    contact: "+91 9447471224",
    actionType: "phone",
    externalUrl: "",
    image: ""
  }
};

const defaultRoutes = [
  { id: "route_1", routeEn: "Mannarkkad - Mukkali - Agali - Anaikatty", routeMl: "മണ്ണാർക്കാട് - മുക്കാലി - അഗളി - ആനക്കട്ടി" },
  { id: "route_2", routeEn: "Coimbatore - Anaikatty - Agali", routeMl: "കോയമ്പത്തൂർ (ഗാന്ധിപുരം) - ആനക്കട്ടി - അഗളി" },
  { id: "route_3", routeEn: "Agali - Sholayur - Anaikatty", routeMl: "അഗളി - ഷോളയൂർ - ആനക്കട്ടി (മേഖലാ സർവീസ്)" },
  { id: "route_4", routeEn: "Agali - Pudur - Mulli", routeMl: "അഗളി - പുതൂർ - മുള്ളി (വനമേഖലാ തനി നാടൻ പാത)" },
  { id: "route_5", routeEn: "Palakkad - Mannarkkad - Agali - Anaikatty", routeMl: "പാലക്കാട് - മണ്ണാർക്കാട് - അഗളി - ആനക്കട്ടി" }
];

const defaultAutos = [
  {
    id: "auto_1",
    driverNameEn: "Ramesh Kumar",
    driverNameMl: "രമേശ് കുമാർ",
    autoNumber: "KL-48-Q-4532",
    contact: "+919495123456",
    locationEn: "Agali",
    locationMl: "അഗളി",
    isAvailable: true,
    registeredDate: "2026-06-01"
  },
  {
    id: "auto_2",
    driverNameEn: "Saji Sebastian",
    driverNameMl: "സജി സെബാസ്റ്റ്യൻ",
    autoNumber: "KL-48-R-9811",
    contact: "+919847123400",
    locationEn: "Goolikkadavu",
    locationMl: "ഗൂളിക്കടവ്",
    isAvailable: true,
    registeredDate: "2026-06-02"
  },
  {
    id: "auto_3",
    driverNameEn: "Mani Swamy",
    driverNameMl: "മണി സ്വാമി",
    autoNumber: "KL-48-S-5544",
    contact: "+918075124312",
    locationEn: "Sholayur",
    locationMl: "ഷോളയൂർ",
    isAvailable: true,
    registeredDate: "2026-06-03"
  },
  {
    id: "auto_4",
    driverNameEn: "Unnikrishnan K.",
    driverNameMl: "ഉണ്ണികൃഷ്ണൻ കെ.",
    autoNumber: "KL-48-B-0714",
    contact: "+919446985472",
    locationEn: "Pudur",
    locationMl: "പുതൂർ",
    isAvailable: true,
    registeredDate: "2026-06-05"
  },
  {
    id: "auto_5",
    driverNameEn: "Senthil Kumar",
    driverNameMl: "സെന്തിൽ കുമാർ",
    autoNumber: "KL-48-D-1290",
    contact: "+917025816301",
    locationEn: "Anakatti",
    locationMl: "ആനക്കട്ടി",
    isAvailable: false,
    registeredDate: "2026-06-08"
  }
];
// ==================== END DEFAULT SEEDS ====================

// ==================== FIRESTORE INTEGRATION ====================
const CONFIG_PATH = path.join(__dirname, "firebase-applet-config.json");
let firestoreDb: any = null;

if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    const firebaseApp = initializeApp(config);
    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
    console.log("🔥 Firebase App & Firestore Client initialized successfully. Database ID:", config.firestoreDatabaseId);
  } catch (error) {
    console.error("❌ Failed to parse firebase-applet-config.json or initialize Firebase. Operating in local JSON fallback mode.", error);
  }
} else {
  console.warn("⚠️ No 'firebase-applet-config.json' found. Operating in local JSON fallback mode.");
}

let lastSavedDatabase: any = null;

// Initial database structure
let database: any = { 
  news: [], 
  events: [], 
  directory: [], 
  emergency: [], 
  opinions: [], 
  destinations: [], 
  cultures: [], 
  stays: [], 
  travelogues: [], 
  photos: [], 
  busRoutes: [],
  routes: [],
  notices: [],
  lpgDeliveries: [],
  autos: [],
  adConfig: defaultAdConfig
};

// Purely local fallback loader (for startup safety and offline configuration)
function loadDatabase() {
  try {
    let db: any = { 
      news: [], 
      events: [], 
      directory: [], 
      emergency: [], 
      opinions: [], 
      destinations: [], 
      cultures: [], 
      stays: [], 
      travelogues: [], 
      photos: [], 
      busRoutes: [],
      routes: [],
      notices: [],
      lpgDeliveries: [],
      autos: defaultAutos,
      adConfig: defaultAdConfig
    };
    
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      db = { ...db, ...JSON.parse(data) };
    }
    
    if (!db.autos || db.autos.length === 0) db.autos = defaultAutos;
    if (!db.destinations || db.destinations.length === 0) db.destinations = defaultDestinations;
    if (!db.cultures || db.cultures.length === 0) db.cultures = defaultCultures;
    if (!db.stays || db.stays.length === 0) db.stays = defaultStays;
    if (!db.travelogues || db.travelogues.length === 0) db.travelogues = defaultTravelogues;
    if (!db.photos || db.photos.length === 0) db.photos = defaultPhotos;
    if (!db.busRoutes || db.busRoutes.length === 0) db.busRoutes = defaultBusRoutes;
    if (!db.routes || db.routes.length === 0) db.routes = defaultRoutes;
    if (!db.emergency || db.emergency.length === 0) db.emergency = defaultEmergencies;
    if (!db.notices || db.notices.length === 0) db.notices = defaultNotices;
    if (!db.lpgDeliveries || db.lpgDeliveries.length === 0) db.lpgDeliveries = defaultLpgDeliveries;
    if (!db.adConfig) db.adConfig = defaultAdConfig;

    return db;
  } catch (err) {
    console.error("Database reading error, returning defaults:", err);
    return { 
      news: [], 
      events: [], 
      directory: [], 
      emergency: defaultEmergencies, 
      opinions: [], 
      destinations: defaultDestinations, 
      cultures: defaultCultures, 
      stays: defaultStays, 
      travelogues: defaultTravelogues, 
      photos: defaultPhotos, 
      busRoutes: defaultBusRoutes,
      routes: defaultRoutes,
      notices: defaultNotices,
      lpgDeliveries: defaultLpgDeliveries,
      adConfig: defaultAdConfig
    };
  }
}

// Background sync function: Diff local memory state vs lastSavedDatabase and persist any changes
async function saveToFirestore(currentDb: any) {
  if (!firestoreDb) return;
  if (!lastSavedDatabase) {
    lastSavedDatabase = JSON.parse(JSON.stringify(currentDb));
    return;
  }

  const collections = [
    { key: "news", col: "news" },
    { key: "opinions", col: "opinions" },
    { key: "events", col: "events" },
    { key: "directory", col: "directory" },
    { key: "emergency", col: "emergency" },
    { key: "notices", col: "notices" },
    { key: "lpgDeliveries", col: "lpgDeliveries" },
    { key: "autos", col: "autos" },
    { key: "destinations", col: "destinations" },
    { key: "cultures", col: "cultures" },
    { key: "stays", col: "stays" },
    { key: "travelogues", col: "travelogues" },
    { key: "photos", col: "photos" },
    { key: "busRoutes", col: "busRoutes" },
    { key: "routes", col: "routes" }
  ];

  for (const entry of collections) {
    const currentList = currentDb[entry.key] || [];
    const lastList = lastSavedDatabase[entry.key] || [];

    // 1. Find additions & updates
    for (const item of currentList) {
      const lastItem = lastList.find((x: any) => x.id === item.id);
      if (!lastItem || JSON.stringify(lastItem) !== JSON.stringify(item)) {
        try {
          const cleanItem = { ...item };
          const docId = cleanItem.id;
          delete cleanItem.id; // Usually we don't save the Firestore document ID redundant inside the doc
          await setDoc(doc(firestoreDb, entry.col, docId), cleanItem);
          console.log(`[Firestore Sync] Saved/Updated [${entry.col}] / [${docId}]`);
        } catch (e) {
          console.error(`[Firestore Sync] Failed to save [${entry.col}] / [${item.id}]:`, e);
        }
      }
    }

    // 2. Find deletions
    for (const lastItem of lastList) {
      if (!currentList.some((x: any) => x.id === lastItem.id)) {
        try {
          await deleteDoc(doc(firestoreDb, entry.col, lastItem.id));
          console.log(`[Firestore Sync] Deleted [${entry.col}] / [${lastItem.id}]`);
        } catch (e) {
          console.error(`[Firestore Sync] Failed to delete [${entry.col}] / [${lastItem.id}]:`, e);
        }
      }
    }
  }

  // Check adConfig
  if (JSON.stringify(currentDb.adConfig) !== JSON.stringify(lastSavedDatabase.adConfig)) {
    try {
      await setDoc(doc(firestoreDb, "metadata", "adConfig"), currentDb.adConfig);
      console.log(`[Firestore Sync] Saved metadata/adConfig`);
    } catch (e) {
      console.error(`[Firestore Sync] Failed to save metadata/adConfig:`, e);
    }
  }

  // Update last status representation
  lastSavedDatabase = JSON.parse(JSON.stringify(currentDb));
}

// Synchronizes and loads everything on server startup
async function initFirestoreDatabase() {
  const fallbackLocalDb = loadDatabase();

  if (!firestoreDb) {
    console.warn("Firestore not initialized. Loading local data.");
    database = fallbackLocalDb || loadDatabase();
    lastSavedDatabase = JSON.parse(JSON.stringify(database));
    return;
  }

  console.log("⚡ Fetching and synchronizing Firestore data...");
  const collections = [
    { col: "news", defaultSeed: [] },
    { col: "opinions", defaultSeed: [] },
    { col: "events", defaultSeed: [] },
    { col: "directory", defaultSeed: [] },
    { col: "emergency", defaultSeed: defaultEmergencies },
    { col: "notices", defaultSeed: defaultNotices },
    { col: "lpgDeliveries", defaultSeed: defaultLpgDeliveries },
    { col: "autos", defaultSeed: defaultAutos },
    { col: "destinations", defaultSeed: defaultDestinations },
    { col: "cultures", defaultSeed: defaultCultures },
    { col: "stays", defaultSeed: defaultStays },
    { col: "travelogues", defaultSeed: defaultTravelogues },
    { col: "photos", defaultSeed: defaultPhotos },
    { col: "busRoutes", defaultSeed: defaultBusRoutes },
    { col: "routes", defaultSeed: defaultRoutes }
  ];

  for (const entry of collections) {
    const key = entry.col;
    try {
      const qSnap = await getDocs(collection(firestoreDb, entry.col));
      const items: any[] = [];
      qSnap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      if (items.length === 0 && entry.defaultSeed.length > 0) {
        console.log(`🌱 Firestore collection [${entry.col}] is empty. Seeding ${entry.defaultSeed.length} defaults...`);
        for (const seedItem of entry.defaultSeed) {
          const docId = seedItem.id || `seed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const cleanItem = { ...seedItem };
          delete cleanItem.id;
          await setDoc(doc(firestoreDb, entry.col, docId), cleanItem);
          items.push({ id: docId, ...cleanItem });
        }
      }

      database[key] = items;
      console.log(`✅ Loaded ${items.length} items for [${key}]`);
    } catch (e) {
      console.error(`❌ Firestore boot/seed error for [${entry.col}], falling back to local file database:`, e);
      if (fallbackLocalDb && Array.isArray(fallbackLocalDb[key]) && fallbackLocalDb[key].length > 0) {
        database[key] = fallbackLocalDb[key];
        console.log(`ℹ️ Recovered ${fallbackLocalDb[key].length} items from local backup for [${key}]`);
      } else {
        database[key] = entry.defaultSeed;
      }
    }
  }

  // Load adConfig from metadata collection
  try {
    const configSnap = await getDoc(doc(firestoreDb, "metadata", "adConfig"));
    if (configSnap.exists()) {
      database.adConfig = configSnap.data();
      console.log("✅ Loaded adConfig from metadata/adConfig");
    } else {
      console.log("🌱 Firestore metadata/adConfig empty. Seeding default adConfig...");
      await setDoc(doc(firestoreDb, "metadata", "adConfig"), defaultAdConfig);
      database.adConfig = defaultAdConfig;
    }
  } catch (e) {
    console.error("❌ Firestore load error for metadata/adConfig, falling back to local adConfig:", e);
    database.adConfig = (fallbackLocalDb && fallbackLocalDb.adConfig) ? fallbackLocalDb.adConfig : defaultAdConfig;
  }

  // Keep a local backup of what was loaded
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(database, null, 2), "utf-8");
  } catch (err) {
    console.error("Backup writing failed:", err);
  }

  lastSavedDatabase = JSON.parse(JSON.stringify(database));
}

// Helper to save database safely
function saveDatabase(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    
    // Trigger Firestore background syncing (safe & non-blocking)
    if (firestoreDb) {
      saveToFirestore(data).catch((err) => {
        console.error("❌ Firestore background sync failed:", err);
      });
    }
    return true;
  } catch (err) {
    console.error("Database writing error:", err);
    return false;
  }
}

// API ENDPOINTS

// 1. Admin Authentication Check
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "attappadi@online") {
    res.json({ success: true, token: "attappadi-sec-2026-auth-token" });
  } else {
    res.status(401).json({ success: false, error: "Incorrect credentials. Try 'admin' and 'attappadi@online'" });
  }
});

// 1b. Database Diagnostic Endpoint
app.get("/api/admin/db-diagnostic", async (req, res) => {
  let isUsingFirestore = !!firestoreDb;
  let status = "disconnected";
  let errorMessage = null;

  const collectionsInfo = {
    news: { localCount: (database.news || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
    events: { localCount: (database.events || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
    notices: { localCount: (database.notices || []).length, firestoreCount: 0, status: "idle", error: null as string | null },
  };

  if (firestoreDb) {
    status = "connected";
    
    // Check News
    try {
      const qSnap = await getDocs(collection(firestoreDb, "news"));
      collectionsInfo.news.firestoreCount = qSnap.size;
      collectionsInfo.news.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.news.status = "error";
      collectionsInfo.news.error = err.message || String(err);
      status = "error";
      errorMessage = err.message || String(err);
    }

    // Check Events
    try {
      const qSnap = await getDocs(collection(firestoreDb, "events"));
      collectionsInfo.events.firestoreCount = qSnap.size;
      collectionsInfo.events.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.events.status = "error";
      collectionsInfo.events.error = err.message || String(err);
    }

    // Check Notices
    try {
      const qSnap = await getDocs(collection(firestoreDb, "notices"));
      collectionsInfo.notices.firestoreCount = qSnap.size;
      collectionsInfo.notices.status = qSnap.size > 0 ? "healthy" : "warning_empty";
    } catch (err: any) {
      collectionsInfo.notices.status = "error";
      collectionsInfo.notices.error = err.message || String(err);
    }
  } else {
    collectionsInfo.news.status = "local";
    collectionsInfo.events.status = "local";
    collectionsInfo.notices.status = "local";
  }

  res.json({
    status,
    isUsingFirestore,
    databaseId: firestoreDb ? "ai-studio-b11a32d4-4bb4-40fb-b67d-2be1f2d002c6" : "none",
    collections: collectionsInfo,
    errorMessage
  });
});

// 2. News CRUD
app.get("/api/news", (req, res) => {
  res.json(database.news || []);
});

app.post("/api/news", (req, res) => {
  const { titleEn, titleMl, contentEn, contentMl, category, regions, image, isSlide, isCard } = req.body;
  if (!titleEn || !titleMl || !contentEn || !contentMl || !category) {
    return res.status(400).json({ error: "Missing required fields for news publishing" });
  }

  const newPost = {
    id: "news_" + Date.now().toString(),
    titleEn,
    titleMl,
    contentEn,
    contentMl,
    category,
    regions: regions || [],
    image: image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60",
    publishedAt: new Date().toISOString(),
    views: 1,
    isSlide: !!isSlide,
    isCard: !!isCard
  };

  database.news = [newPost, ...database.news];
  saveDatabase(database);
  res.status(201).json(newPost);
});

app.put("/api/news/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, category, regions, image, isSlide, isCard } = req.body;
  
  let found = false;
  database.news = database.news.map((item: any) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        titleEn: titleEn !== undefined ? titleEn : item.titleEn,
        titleMl: titleMl !== undefined ? titleMl : item.titleMl,
        contentEn: contentEn !== undefined ? contentEn : item.contentEn,
        contentMl: contentMl !== undefined ? contentMl : item.contentMl,
        category: category !== undefined ? category : item.category,
        regions: regions !== undefined ? regions : item.regions,
        image: image !== undefined ? image : item.image,
        isSlide: isSlide !== undefined ? !!isSlide : item.isSlide,
        isCard: isCard !== undefined ? !!isCard : item.isCard
      };
    }
    return item;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "News item not found" });
  }
});

app.delete("/api/news/:id", (req, res) => {
  const { id } = req.params;
  database.news = database.news.filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Ad Config routes
app.get("/api/adconfig", (req, res) => {
  res.json(database.adConfig || defaultAdConfig);
});

app.put("/api/adconfig", (req, res) => {
  const { leftAd, rightAd } = req.body;
  
  if (!leftAd || !rightAd) {
    return res.status(400).json({ error: "Missing leftAd or rightAd setup parameters" });
  }

  database.adConfig = {
    leftAd: {
      titleEn: leftAd.titleEn || "",
      titleMl: leftAd.titleMl || "",
      subtitleEn: leftAd.subtitleEn || "",
      subtitleMl: leftAd.subtitleMl || "",
      contact: leftAd.contact || "",
      actionType: leftAd.actionType || "share",
      externalUrl: leftAd.externalUrl || "",
      image: leftAd.image || ""
    },
    rightAd: {
      titleEn: rightAd.titleEn || "",
      titleMl: rightAd.titleMl || "",
      subtitleEn: rightAd.subtitleEn || "",
      subtitleMl: rightAd.subtitleMl || "",
      contact: rightAd.contact || "",
      actionType: rightAd.actionType || "phone",
      externalUrl: rightAd.externalUrl || "",
      image: rightAd.image || ""
    }
  };

  saveDatabase(database);
  res.json({ success: true, adConfig: database.adConfig });
});

app.post("/api/news/:id/view", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.news = database.news.map((item: any) => {
    if (item.id === id) {
      found = true;
      return { ...item, views: (item.views || 0) + 1 };
    }
    return item;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "News not found" });
  }
});

// 3. User Opinion Board
app.get("/api/opinions", (req, res) => {
  res.json(database.opinions || []);
});

app.post("/api/opinions", (req, res) => {
  const { authorName, titleEn, titleMl, contentEn, contentMl, approved } = req.body;
  if (!authorName || !titleEn || !contentEn) {
    return res.status(400).json({ error: "Missing author name, title, or opinion content." });
  }

  const newOpinion = {
    id: "opinion_" + Date.now().toString(),
    authorName,
    titleEn,
    titleMl: titleMl || titleEn,
    contentEn,
    contentMl: contentMl || contentEn,
    createdAt: new Date().toISOString(),
    approved: approved !== undefined ? !!approved : false
  };

  database.opinions = [newOpinion, ...database.opinions];
  saveDatabase(database);
  res.status(201).json(newOpinion);
});

app.put("/api/opinions/:id", (req, res) => {
  const { id } = req.params;
  const { authorName, titleEn, titleMl, contentEn, contentMl, approved } = req.body;
  let found = false;
  database.opinions = database.opinions.map((op: any) => {
    if (op.id === id) {
      found = true;
      return {
        ...op,
        authorName: authorName !== undefined ? authorName : op.authorName,
        titleEn: titleEn !== undefined ? titleEn : op.titleEn,
        titleMl: titleMl !== undefined ? titleMl : op.titleMl,
        contentEn: contentEn !== undefined ? contentEn : op.contentEn,
        contentMl: contentMl !== undefined ? contentMl : op.contentMl,
        approved: approved !== undefined ? !!approved : op.approved
      };
    }
    return op;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Opinion not found" });
  }
});

app.post("/api/opinions/approve/:id", (req, res) => {
  const { id } = req.params;
  database.opinions = database.opinions.map((op: any) => {
    if (op.id === id) {
      return { ...op, approved: true };
    }
    return op;
  });
  saveDatabase(database);
  res.json({ success: true });
});

app.post("/api/opinions/delete/:id", (req, res) => {
  const { id } = req.params;
  database.opinions = database.opinions.filter((op: any) => op.id !== id);
  saveDatabase(database);
  res.json({ success: true });
});

// 4. Events Calendar
app.get("/api/events", (req, res) => {
  res.json(database.events || []);
});

app.post("/api/events", (req, res) => {
  const { titleEn, titleMl, date, time, locationEn, locationMl, descriptionEn, descriptionMl } = req.body;
  if (!titleEn || !titleMl || !date || !locationEn || !locationMl) {
    return res.status(400).json({ error: "Missing required event fields" });
  }

  const newEvent = {
    id: "event_" + Date.now().toString(),
    titleEn,
    titleMl,
    date,
    time: time || "All Day",
    locationEn,
    locationMl,
    descriptionEn: descriptionEn || "",
    descriptionMl: descriptionMl || ""
  };

  database.events = [newEvent, ...database.events];
  saveDatabase(database);
  res.status(201).json(newEvent);
});

app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, date, time, locationEn, locationMl, descriptionEn, descriptionMl } = req.body;
  let found = false;
  database.events = database.events.map((ev: any) => {
    if (ev.id === id) {
      found = true;
      return {
        ...ev,
        titleEn: titleEn !== undefined ? titleEn : ev.titleEn,
        titleMl: titleMl !== undefined ? titleMl : ev.titleMl,
        date: date !== undefined ? date : ev.date,
        time: time !== undefined ? time : ev.time,
        locationEn: locationEn !== undefined ? locationEn : ev.locationEn,
        locationMl: locationMl !== undefined ? locationMl : ev.locationMl,
        descriptionEn: descriptionEn !== undefined ? descriptionEn : ev.descriptionEn,
        descriptionMl: descriptionMl !== undefined ? descriptionMl : ev.descriptionMl
      };
    }
    return ev;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  database.events = database.events.filter((ev: any) => ev.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 5. Local Services Directory
app.get("/api/directory", (req, res) => {
  res.json(database.directory || []);
});

app.post("/api/directory", (req, res) => {
  const { nameEn, nameMl, category, contact, locationEn, locationMl } = req.body;
  if (!nameEn || !nameMl || !category || !contact) {
    return res.status(400).json({ error: "Missing directory required fields" });
  }

  const newListing = {
    id: "dir_" + Date.now().toString(),
    nameEn,
    nameMl,
    category,
    contact,
    locationEn: locationEn || "Attappadi",
    locationMl: locationMl || "അട്ടപ്പാടി"
  };

  database.directory = [...database.directory, newListing];
  saveDatabase(database);
  res.status(201).json(newListing);
});

app.put("/api/directory/:id", (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, category, contact, locationEn, locationMl } = req.body;
  let found = false;
  database.directory = database.directory.map((item: any) => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        nameEn: nameEn !== undefined ? nameEn : item.nameEn,
        nameMl: nameMl !== undefined ? nameMl : item.nameMl,
        category: category !== undefined ? category : item.category,
        contact: contact !== undefined ? contact : item.contact,
        locationEn: locationEn !== undefined ? locationEn : item.locationEn,
        locationMl: locationMl !== undefined ? locationMl : item.locationMl
      };
    }
    return item;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Directory entry not found" });
  }
});

app.delete("/api/directory/:id", (req, res) => {
  const { id } = req.params;
  database.directory = database.directory.filter((item: any) => item.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// 6. Emergency Contacts CRUD
app.get("/api/emergency", (req, res) => {
  res.json(database.emergency || []);
});

app.post("/api/emergency", (req, res) => {
  const { nameEn, nameMl, number, type } = req.body;
  if (!nameEn || !nameMl || !number || !type) {
    return res.status(400).json({ error: "Missing required emergency fields" });
  }

  const newEmerg = {
    id: "em_" + Date.now().toString(),
    nameEn,
    nameMl,
    number,
    type
  };

  database.emergency = [...database.emergency, newEmerg];
  saveDatabase(database);
  res.status(201).json(newEmerg);
});

app.put("/api/emergency/:id", (req, res) => {
  const { id } = req.params;
  const { nameEn, nameMl, number, type } = req.body;
  let found = false;
  database.emergency = database.emergency.map((em: any) => {
    if (em.id === id) {
      found = true;
      return {
        ...em,
        nameEn: nameEn !== undefined ? nameEn : em.nameEn,
        nameMl: nameMl !== undefined ? nameMl : em.nameMl,
        number: number !== undefined ? number : em.number,
        type: type !== undefined ? type : em.type
      };
    }
    return em;
  });
  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Emergency contact not found" });
  }
});

app.delete("/api/emergency/:id", (req, res) => {
  const { id } = req.params;
  database.emergency = database.emergency.filter((em: any) => em.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Notices CRUD Endpoints
app.get("/api/notices", (req, res) => {
  res.json(database.notices || []);
});

app.post("/api/notices", (req, res) => {
  const { titleEn, titleMl, contentEn, contentMl, type, severity, date, active, image } = req.body;
  if (!noticesParamsCheck(req.body)) {
    return res.status(400).json({ error: "Missing required fields for Notice" });
  }

  const newNotice = {
    id: "not_" + Date.now().toString(),
    titleEn,
    titleMl,
    contentEn,
    contentMl,
    type: type || "notice",
    severity: severity || "medium",
    date: date || new Date().toISOString().split("T")[0],
    active: active !== undefined ? active : true,
    image: image || ""
  };

  database.notices = [...(database.notices || []), newNotice];
  saveDatabase(database);
  res.status(201).json(newNotice);
});

function noticesParamsCheck(body: any) {
  return body.titleEn && body.titleMl && body.contentEn && body.contentMl;
}

app.put("/api/notices/:id", (req, res) => {
  const { id } = req.params;
  const { titleEn, titleMl, contentEn, contentMl, type, severity, date, active, image } = req.body;
  let found = false;
  database.notices = (database.notices || []).map((not: any) => {
    if (not.id === id) {
      found = true;
      return {
        ...not,
        titleEn: titleEn !== undefined ? titleEn : not.titleEn,
        titleMl: titleMl !== undefined ? titleMl : not.titleMl,
        contentEn: contentEn !== undefined ? contentEn : not.contentEn,
        contentMl: contentMl !== undefined ? contentMl : not.contentMl,
        type: type !== undefined ? type : not.type,
        severity: severity !== undefined ? severity : not.severity,
        date: date !== undefined ? date : not.date,
        active: active !== undefined ? active : not.active,
        image: image !== undefined ? image : not.image
      };
    }
    return not;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Notice not found" });
  }
});

app.delete("/api/notices/:id", (req, res) => {
  const { id } = req.params;
  database.notices = (database.notices || []).filter((not: any) => not.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// LPG Deliveries CRUD Endpoints
app.get("/api/lpg", (req, res) => {
  res.json(database.lpgDeliveries || []);
});

app.post("/api/lpg", (req, res) => {
  const { agencyNameEn, agencyNameMl, areasEn, areasMl, date, statusEn, statusMl, contact, notesEn, notesMl } = req.body;
  if (!agencyNameEn || !agencyNameMl || !areasEn || !areasMl || !date || !contact) {
    return res.status(400).json({ error: "Missing required fields for LPG Delivery" });
  }

  const newLpg = {
    id: "lpg_" + Date.now().toString(),
    agencyNameEn,
    agencyNameMl,
    areasEn,
    areasMl,
    date,
    statusEn: statusEn || "Delivering Today",
    statusMl: statusMl || "ഇന്ന് വിതരണമുണ്ട്",
    contact,
    notesEn: notesEn || "",
    notesMl: notesMl || ""
  };

  database.lpgDeliveries = [...(database.lpgDeliveries || []), newLpg];
  saveDatabase(database);
  res.status(201).json(newLpg);
});

app.put("/api/lpg/:id", (req, res) => {
  const { id } = req.params;
  const { agencyNameEn, agencyNameMl, areasEn, areasMl, date, statusEn, statusMl, contact, notesEn, notesMl } = req.body;
  let found = false;
  database.lpgDeliveries = (database.lpgDeliveries || []).map((lpg: any) => {
    if (lpg.id === id) {
      found = true;
      return {
        ...lpg,
        agencyNameEn: agencyNameEn !== undefined ? agencyNameEn : lpg.agencyNameEn,
        agencyNameMl: agencyNameMl !== undefined ? agencyNameMl : lpg.agencyNameMl,
        areasEn: areasEn !== undefined ? areasEn : lpg.areasEn,
        areasMl: areasMl !== undefined ? areasMl : lpg.areasMl,
        date: date !== undefined ? date : lpg.date,
        statusEn: statusEn !== undefined ? statusEn : lpg.statusEn,
        statusMl: statusMl !== undefined ? statusMl : lpg.statusMl,
        contact: contact !== undefined ? contact : lpg.contact,
        notesEn: notesEn !== undefined ? notesEn : lpg.notesEn,
        notesMl: notesMl !== undefined ? notesMl : lpg.notesMl
      };
    }
    return lpg;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "LPG delivery schedule not found" });
  }
});

app.delete("/api/lpg/:id", (req, res) => {
  const { id } = req.params;
  database.lpgDeliveries = (database.lpgDeliveries || []).filter((lpg: any) => lpg.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// Autorikshaw Taxi Service Endpoints
app.get("/api/autos", (req, res) => {
  res.json(database.autos || []);
});

app.post("/api/autos", (req, res) => {
  const { driverNameEn, driverNameMl, autoNumber, contact, locationEn, locationMl, isAvailable } = req.body;
  if (!driverNameEn || !driverNameMl || !autoNumber || !contact || !locationEn || !locationMl) {
    return res.status(400).json({ error: "Missing required fields for Autorikshaw Service" });
  }

  const newAuto = {
    id: "auto_" + Date.now().toString(),
    driverNameEn,
    driverNameMl,
    autoNumber,
    contact,
    locationEn,
    locationMl,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    registeredDate: new Date().toISOString().split("T")[0]
  };

  database.autos = [...(database.autos || []), newAuto];
  saveDatabase(database);
  res.status(201).json(newAuto);
});

app.put("/api/autos/:id", (req, res) => {
  const { id } = req.params;
  const { driverNameEn, driverNameMl, autoNumber, contact, locationEn, locationMl, isAvailable } = req.body;
  let found = false;
  
  database.autos = (database.autos || []).map((aut: any) => {
    if (aut.id === id) {
      found = true;
      return {
        ...aut,
        driverNameEn: driverNameEn !== undefined ? driverNameEn : aut.driverNameEn,
        driverNameMl: driverNameMl !== undefined ? driverNameMl : aut.driverNameMl,
        autoNumber: autoNumber !== undefined ? autoNumber : aut.autoNumber,
        contact: contact !== undefined ? contact : aut.contact,
        locationEn: locationEn !== undefined ? locationEn : aut.locationEn,
        locationMl: locationMl !== undefined ? locationMl : aut.locationMl,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : aut.isAvailable
      };
    }
    return aut;
  });

  if (found) {
    saveDatabase(database);
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: "Autorikshaw entry not found" });
  }
});

app.delete("/api/autos/:id", (req, res) => {
  const { id } = req.params;
  database.autos = (database.autos || []).filter((aut: any) => aut.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});


// 7. EXPLORE ATTAPPADI SUB-SECTIONS (destinations, cultures, stays, travelogues, photos)
// DESTINATIONS
app.get("/api/destinations", (req, res) => res.json(database.destinations || []));
app.post("/api/destinations", (req, res) => {
  const item = { id: "dest_" + Date.now().toString(), ...req.body };
  database.destinations = [...(database.destinations || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/destinations/:id", (req, res) => {
  const { id } = req.params;
  database.destinations = (database.destinations || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/destinations/:id", (req, res) => {
  const { id } = req.params;
  database.destinations = (database.destinations || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// CULTURES/FOOD
app.get("/api/cultures", (req, res) => res.json(database.cultures || []));
app.post("/api/cultures", (req, res) => {
  const item = { id: "cult_" + Date.now().toString(), ...req.body };
  database.cultures = [...(database.cultures || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/cultures/:id", (req, res) => {
  const { id } = req.params;
  database.cultures = (database.cultures || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/cultures/:id", (req, res) => {
  const { id } = req.params;
  database.cultures = (database.cultures || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// STAYS
app.get("/api/stays", (req, res) => res.json(database.stays || []));
app.post("/api/stays", (req, res) => {
  const item = { id: "stay_" + Date.now().toString(), ...req.body };
  database.stays = [...(database.stays || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/stays/:id", (req, res) => {
  const { id } = req.params;
  database.stays = (database.stays || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/stays/:id", (req, res) => {
  const { id } = req.params;
  database.stays = (database.stays || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// TRAVELOGUES
app.get("/api/travelogues", (req, res) => res.json(database.travelogues || []));
app.post("/api/travelogues", (req, res) => {
  const item = { id: "trav_" + Date.now().toString(), ...req.body };
  database.travelogues = [...(database.travelogues || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/travelogues/:id", (req, res) => {
  const { id } = req.params;
  database.travelogues = (database.travelogues || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/travelogues/:id", (req, res) => {
  const { id } = req.params;
  database.travelogues = (database.travelogues || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// PHOTO HUB
app.get("/api/photos", (req, res) => res.json(database.photos || []));
app.post("/api/photos", (req, res) => {
  const item = { id: "photo_" + Date.now().toString(), ...req.body };
  database.photos = [...(database.photos || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/photos/:id", (req, res) => {
  const { id } = req.params;
  database.photos = (database.photos || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/photos/:id", (req, res) => {
  const { id } = req.params;
  database.photos = (database.photos || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// BUS TIMINGS/ROUTES
app.get("/api/busroutes", (req, res) => res.json(database.busRoutes || []));
app.post("/api/busroutes", (req, res) => {
  const item = { id: "bus_" + Date.now().toString(), ...req.body };
  database.busRoutes = [...(database.busRoutes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.put("/api/busroutes/:id", (req, res) => {
  const { id } = req.params;
  database.busRoutes = (database.busRoutes || []).map((x: any) => x.id === id ? { ...x, ...req.body } : x);
  saveDatabase(database);
  res.json({ success: true, id });
});
app.delete("/api/busroutes/:id", (req, res) => {
  const { id } = req.params;
  database.busRoutes = (database.busRoutes || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});

// GENERIC ROUTES ENDPOINTS
app.get("/api/routes", (req, res) => res.json(database.routes || []));
app.post("/api/routes", (req, res) => {
  const item = { id: "route_" + Date.now().toString(), ...req.body };
  database.routes = [...(database.routes || []), item];
  saveDatabase(database);
  res.status(201).json(item);
});
app.delete("/api/routes/:id", (req, res) => {
  const { id } = req.params;
  database.routes = (database.routes || []).filter((x: any) => x.id !== id);
  saveDatabase(database);
  res.json({ success: true, id });
});


// 8. AI Assistants integration with Gemini Web API
app.post("/api/admin/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text) return res.status(400).json({ error: "No text supplied for translation" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server. Please check Settings > Secrets." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const isToMalayalam = targetLang === "ml";
    const prompt = isToMalayalam 
      ? `You are an expert translator for 'Attappadi Online' portal.
         Translate the following English text into native, natural, clear, and culturally accurate Malayalam.
         The translation MUST be completely natural in tone and generic in words, suitable for news articles, local shop directories, ad campaigns, notices, emergency alerts, or schedules.
         Ensure perfect Malayalam grammar and phrasing. Avoid robotic or overly literal word-by-word translation.
         Return ONLY the translated Malayalam text and nothing else. No introductions, explanations, or markdown block styling.
         
         Text to Translate:
         ${text}`
      : `You are an expert translator for 'Attappadi Online' portal.
         Translate the following Malayalam text into clear, completely natural, error-free, and appropriate English.
         The translation MUST be perfectly natural in tone, general-purpose/generic in phrasing, and appropriate for local directories, public boards, transit, or notices.
         Keep place names accurate: Agali, Mukkali, Thavalam, Kottathara, Sholayur, Pudur, Anaikatty, etc.
         Return ONLY the translated English text and nothing else. No introductions, explanations, or markdown block styling.
         
         Text to Translate:
         ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ translatedText: response.text?.trim() });
  } catch (err: any) {
    console.log(`Translation Notice - Gemini API returned notice: ${err.message || "Rate limited/Quota Exceeded"}. Trying MyMemory free backup translator...`);
    
    // BACKUP FREE TRANSLATION ENGINE (MyMemory Translate API - completely free, no key required)
    try {
      const isToMalayalam = targetLang === "ml";
      const langpair = isToMalayalam ? "en|ml" : "ml|en";
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;
      
      const backupResponse = await fetch(myMemoryUrl, {
        headers: { "User-Agent": "AttappadiOnlinePortal/1.0" }
      });
      
      if (backupResponse.ok) {
        const data: any = await backupResponse.json();
        const translatedBackup = data?.responseData?.translatedText;
        if (translatedBackup) {
          console.log("MyMemory Backup Translator successfully fetched translation:", translatedBackup);
          return res.json({
            translatedText: translatedBackup.trim(),
            isBackup: true,
            warning: "Fallback to active Free public translation service engine."
          });
        }
      }
    } catch (backupErr: any) {
      console.log("MyMemory Backup Translator also failed:", backupErr.message);
    }

    // Graceful fallback to original text if both Gemini and the backup fail
    res.json({ 
      translatedText: text, 
      isFallback: true, 
      warning: "All translation engines temporarily unavailable. Visual placeholder returned.",
      error: err.message || "Failed to communicate with translation assistant." 
    });
  }
});

// AI Assisted news generation/expansion helper
app.post("/api/admin/ai-generate", async (req, res) => {
  const { titleSuggest, mainPoints } = req.body;
  if (!titleSuggest) return res.status(400).json({ error: "Please provide a headline or idea." });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server. Please check Settings > Secrets." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });

    const prompt = `You are a master local reporter for 'Attappadi Online' in Kerala, Palakkad district.
      Write an elegant, professional, trustworthy news article based on this idea: "${titleSuggest}".
      Points outline or clues: "${mainPoints || "None provided. Generate realistic news matching local issues in Attappadi Block"}".
      
      Generate a realistic, balanced news report suited for Attappadi locals. Output should include high-quality Malayalam and English titles and narratives.
      Your response MUST be strict valid JSON matching exactly the schemas below. No markdown wrap, no backticks enclosing, just pure JSON text.
      
      JSON Scheme to return:
      {
        "titleEn": "A concise English news headline",
        "titleMl": "നല്ല ശൈലിയിലുള്ള മലയാളം വാർത്താ തലക്കെട്ട്",
        "contentEn": "A detailed, professional two-paragraph English news article writing",
        "contentMl": "വിശദവും പത്രപ്രവർത്തന ശൈലിയിലുള്ളതുമായ രണ്ടു ഖണ്ഡികകളുള്ള മലയാളം വാർത്താ വിവരണം"
      }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.log(`AI Assist Notice - API service returned notice: ${err.message || "Rate limited"}`);
    res.status(500).json({ error: err.message || "Failed to generate AI reporting assist content." });
  }
});

// Dynamic Weather information helper
app.get("/api/weather", (req, res) => {
  const hour = new Date().getHours();
  const baseTemp = (hour < 7 || hour > 19) ? 21 : 28;
  
  const weatherData = {
    blockName: "Attappadi Block valley",
    conditionEn: hour > 10 && hour < 17 ? "Scattered Showers" : "Mist & Heavy Overcast",
    conditionMl: hour > 10 && hour < 17 ? "ചിലയിടങ്ങളിൽ മഴ" : "മൂടൽമഞ്ഞും കനത്ത മേഘാവൃതമായ അന്തരീക്ഷവും",
    humidity: "86%",
    breezeEn: "SW 18 km/h",
    breezeMl: "തെക്ക്-പടിഞ്ഞാറൻ കാറ്റ് 18 കി.മീ/മണിക്കൂർ",
    subRegions: [
      { name: "Agali (Town)", temp: baseTemp + 1, conditionEn: "Overcast", conditionMl: "മേഘാവൃതം" },
      { name: "Mukkali (Hills)", temp: baseTemp - 2, conditionEn: "Continuous drizzle", conditionMl: "തുള്ളിമഴ" },
      { name: "Thavalam", temp: baseTemp + 0.5, conditionEn: "Passing Clouds", conditionMl: "മേഘങ്ങൾ" },
      { name: "Kottathara", temp: baseTemp + 0, conditionEn: "Heavy Breeze", conditionMl: "ശക്തമായ കാറ്റ്" },
      { name: "Sholayur", temp: baseTemp + 1.5, conditionEn: "Windy & Sunny", conditionMl: "കാറ്റുള്ള അന്തരീക്ഷം" },
      { name: "Pudur", temp: baseTemp - 1, conditionEn: "Mist Cover", conditionMl: "മൂടൽമഞ്ഞ്" },
      { name: "Anaikatty", temp: baseTemp + 2, conditionEn: "Humid & Cloudy", conditionMl: "മേഘാവൃതം" },
      { name: "Jellippara", temp: baseTemp - 0.5, conditionEn: "Cool Breeze", conditionMl: "തണുത്ത കാറ്റ്" },
      { name: "Chittur", temp: baseTemp + 1, conditionEn: "Light Showers", conditionMl: "ചെറിയ തോതിൽ മഴ" }
    ]
  };
  res.json(weatherData);
});

app.all("*", (req, res) => {
  res.status(200).json({
    message: "Attappadi Online Catch-all Router Debug",
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method,
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL
    }
  });
});

// Setup dev server with Vite OR static server in production
async function startServer() {
  // Synchronize with Firestore before starting request listeners
  try {
    await initFirestoreDatabase();
  } catch (err) {
    console.error("❌ Critical error during Firestore initialization:", err);
  }

  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      // Dynamically import Vite only in development to prevent native dependency issues on Vercel
      const { createServer: createViteServer } = await import("vite");
      // Mount Vite for development
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Serve production static build assets
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Attappadi Online Server is listening successfully on port ${PORT}`);
    });
  }
}

startServer();

export default app;
