import { adminFetch } from "../services/adminAuth";
import React, { useState, useEffect } from "react";
import BusStopOSMMap from "./BusStopOSMMap";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Compass, UtensilsCrossed, Hotel, BookOpen, Image as ImageIcon, X, ChevronLeft, ChevronRight, Share2, Volume2, Bus, Clock, Search, Info, Sliders, Plus, Trash, Link, RotateCcw, Copy, Check, Move } from "lucide-react";
import { DestinationItem, CultureItem, StayItem, TravelogueItem, PhotoItem, BusRouteItem } from "../types";

interface ExploreAttappadiProps {
  lang: "en" | "ml" | "ta";
  initialTab?: "destinations" | "food" | "stays" | "travelogues" | "photos" | "culture" | "busTimings";
  isAdmin?: boolean;
  hideTabsSelection?: boolean;
  onEditBusRoute?: (id: string) => void;
  onDeleteBusRoute?: (id: string) => void;
}

// Default backup data lists
const defaultDestinations: DestinationItem[] = [];

const defaultCultures: CultureItem[] = [];

const defaultStays: StayItem[] = [];

const defaultTravelogues: TravelogueItem[] = [];

const defaultPhotos: PhotoItem[] = [];

const defaultBusRoutes: BusRouteItem[] = [
  {
    id: "bus_1",
    routeTa: "கோழிக்கோடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC விரைவுப் பயணிகள் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "மாவட்டங்களுக்கு இடையிலான சேவை",
    timingsTa: "மஞ்சேரி, மேலாற்றூர், மன்னார்க்காடு வழியாக",
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
    routeTa: "பாலக்காடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC விரைவுப் பயணிகள் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "காலை பணிமனைச் சேவை",
    timingsTa: "மன்னார்க்காடு, அகளி வழியாக",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC)",
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
    routeTa: "பாலக்காடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC சாதாரணப் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "மதிய பணிமனைச் சேவை",
    timingsTa: "மன்னார்க்காடு, அகளி வழியாக",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC)",
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
    routeTa: "பாலக்காடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC விரைவுப் பயணிகள் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "மாலை பணிமனைச் சேவை",
    timingsTa: "மன்னார்க்காடு, அகளி வழியாக",
    routeEn: "PALAKKAD - ANAIKATTY (KSRTC)",
    routeMl: "പാലക്കാട് - ആനക്കട്ടി (KSRTC)",
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
    routeTa: "கோட்டயம் – ஆனைகட்டி (KSRTC SWIFT)",
    busTypeTa: "SWIFT அதிவிரைவுப் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "நீண்ட தூர மாநிலங்களுக்கு இடையிலான இணைப்பு",
    timingsTa: "திருச்சூர், பாலக்காடு, மன்னார்க்காடு வழியாக",
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
    routeTa: "குருவாயூர் – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC விரைவுப் பயணிகள் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "புனித யாத்திரை வழித்தடம்",
    timingsTa: "ஷோரனூர், மன்னார்க்காடு, அகளி வழியாக",
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
    routeTa: "மன்னார்க்காடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC விரைவுப் பயணிகள் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "பள்ளத்தாக்கு இணைப்புச் சேவை",
    timingsTa: "முக்காலி, அகளி, கூளிக்கடவு வழியாக",
    routeEn: "MANNARKKAD - ANAIKATTY (KSRTC)",
    routeMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി (KSRTC)",
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
    routeTa: "மன்னார்க்காடு – ஆனைகட்டி (KSRTC)",
    busTypeTa: "KSRTC இரவு நேர சாதாரணப் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "இரவு நேரச் சேவை",
    timingsTa: "முக்காலி, அகளி வழியாக",
    routeEn: "MANNARKKAD - ANAIKATTY (KSRTC)",
    routeMl: "മണ്ണാർക്കാട് - ആനക്കട്ടി (KSRTC)",
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
    routeTa: "அகளி – புதூர் – முள்ளி (KSRTC)",
    busTypeTa: "KSRTC வனப்பகுதி சாதாரணப் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "வன எல்லைப் பகுதி வழித்தடம்",
    timingsTa: "கோட்டத்தறை, புதூர் வழியாக",
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
    routeTa: "ஆனைகட்டி – கோயம்புத்தூர் (TNSTC)",
    busTypeTa: "TNSTC தொடர் இணைப்புப் பேருந்துகள்",
    runsTa: "எல்லை இணைப்புப் பேருந்து (30–40 நிமிடங்களுக்கு ஒருமுறை)",
    frequencyTa: "கோயம்புத்தூருக்கு நேரடிச் சேவை",
    timingsTa: "கணுவாய், தடாகம் சாலை வழியாக",
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
    routeTa: "கோயம்புத்தூர் – ஆனைகட்டி – அகளி (TNSTC)",
    busTypeTa: "TNSTC சாதாரணப் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "கோயம்புத்தூர் இணைப்புச் சேவை",
    timingsTa: "தடாகம் சாலை, கணுவாய் வழியாக",
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
    routeTa: "மன்னார்க்காடு – ஆனைகட்டி (தனியார் பேருந்து)",
    busTypeTa: "SRP தனியார் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "மாலை நேரச் சேவை",
    timingsTa: "முக்காலி, அகளி வழியாக",
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
    routeTa: "ஆனைகட்டி – மன்னார்க்காடு (தனியார் பேருந்து)",
    busTypeTa: "SRP தனியார் பேருந்து",
    runsTa: "தினசரி சேவை",
    frequencyTa: "காலை நேரச் சேவை",
    timingsTa: "அகளி, முக்காலி வழியாக",
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

export const DEFAULT_MAP_NODES = [
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

export default function ExploreAttappadi({ lang, initialTab = "destinations", isAdmin = false, hideTabsSelection = false, onEditBusRoute, onDeleteBusRoute }: ExploreAttappadiProps) {
  const safeParseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map(x => x.trim()).filter(Boolean);
    return [];
  };

  const [activeTab, setActiveTab] = useState<"destinations" | "food" | "stays" | "travelogues" | "photos" | "culture" | "busTimings">(initialTab);

  const [mapNodes, setMapNodes] = useState<{ id: string; x: number; y: number; nameEn: string; nameMl: string; nameTa?: string }[]>(() => {
    try {
      const saved = localStorage.getItem("attappadi_map_nodes2");
      return saved ? JSON.parse(saved) : DEFAULT_MAP_NODES;
    } catch (e) {
      return DEFAULT_MAP_NODES;
    }
  });

  const [stationAutoTranslate, setStationAutoTranslate] = useState(true);
  const [stationTranslationBusy, setStationTranslationBusy] = useState(false);
  const translateStationNames = async (names: { nameEn: string; nameMl: string; nameTa?: string }, source: "en" | "ml" | "ta") => {
    if (!stationAutoTranslate) return names;
    const fields = { en: "nameEn", ml: "nameMl", ta: "nameTa" } as const;
    const text = names[fields[source]]?.trim();
    if (!text) return names;
    setStationTranslationBusy(true);
    try {
      const translated = { ...names };
      await Promise.all((["ml", "en", "ta"] as const).filter(lang => lang !== source).map(async lang => {
        if (translated[fields[lang]]?.trim()) return;
        const response = await adminFetch("/api/admin/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, sourceLang: source, targetLang: lang }) });
        if (!response.ok) throw new Error("Translation request failed");
        const result = await response.json();
        const translatedText = typeof result.translatedText === "string" ? result.translatedText.trim() : "";
        if (result.isFallback || !translatedText || (lang === "ta" && !/[\u0B80-\u0BFF]/.test(translatedText))) throw new Error("Valid Tamil translation unavailable");
        translated[fields[lang]] = translatedText;
      }));
      return translated;
    } catch (error) { console.error("Station translation failed", error); setChartMessage("Translation unavailable. Enter Tamil manually and save to database."); return names; }
    finally { setStationTranslationBusy(false); }
  };

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

  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartSaving, setChartSaving] = useState(false);
  const [chartMessage, setChartMessage] = useState("");
  // Database is authoritative. Do not overwrite shared data with browser-local edits.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/station-chart").then(async response => {
      if (!response.ok) throw new Error("Could not load shared station chart");
      return response.json();
    }).then(data => {
      if (cancelled) return;
      if (Array.isArray(data.nodes) && Array.isArray(data.lines)) {
        setMapNodes(data.nodes);
        setMapLines(data.lines);
      }
      setChartLoaded(true);
    }).catch(error => { if (!cancelled) { setChartMessage(error.message); setChartLoaded(true); } });
    return () => { cancelled = true; };
  }, []);
  const saveStationChart = async (nodes = mapNodes, lines = mapLines) => {
    if (!isAdmin || !chartLoaded) return;
    setChartSaving(true); setChartMessage("");
    try {
      const normalizedNodes = nodes.map(n => ({ ...n, nameTa: n.nameTa || "" }));
      const response = await adminFetch("/api/station-chart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nodes: normalizedNodes, lines }) });
      if (!response.ok) throw new Error((await response.json()).error || "Unable to save station chart");
      setMapNodes(normalizedNodes);
      localStorage.setItem("attappadi_map_nodes2", JSON.stringify(normalizedNodes));
      setChartMessage("Saved to database. Changes are available across devices.");
    } catch (error: any) { setChartMessage(error.message || "Database save failed"); }
    finally { setChartSaving(false); }
  };

  const [destinationsList, setDestinationsList] = useState<DestinationItem[]>(defaultDestinations);
  const [culturesList, setCulturesList] = useState<CultureItem[]>(defaultCultures);
  const [staysList, setStaysList] = useState<StayItem[]>(defaultStays);
  const [traveloguesList, setTraveloguesList] = useState<TravelogueItem[]>(defaultTravelogues);
  const [photosList, setPhotosList] = useState<PhotoItem[]>(defaultPhotos);
  const [busRoutesList, setBusRoutesList] = useState<BusRouteItem[]>([]);
  const [busInformation, setBusInformation] = useState<Array<{id:string;contentMl:string;contentEn:string;contentTa:string}>>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  
  // Bus timings search & filter state
  const [busSearch, setBusSearch] = useState("");
  const [busNameQuery, setBusNameQuery] = useState("");
  const [busTypeFilter, setBusTypeFilter] = useState("ALL");
  const [selectedMapStop, setSelectedMapStop] = useState<string>("AGALI");
  const [navSource, setNavSource] = useState<string>("MANNARKKAD");
  const [navDest, setNavDest] = useState<string>("ANAIKKATTY");
  const [selectedAssistPlace, setSelectedAssistPlace] = useState<string>("silent_valley");
  const [busTimingMode, setBusTimingMode] = useState<"stop" | "directions" | "assist">("stop");

  const refreshDynamicContent = () => {
    fetch("/api/destinations")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDestinationsList(data); })
      .catch(err => console.error("Error loading destinations:", err));

    fetch("/api/cultures")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCulturesList(data); })
      .catch(err => console.error("Error loading cultures:", err));

    fetch("/api/stays")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStaysList(data); })
      .catch(err => console.error("Error loading stays:", err));

    fetch("/api/travelogues")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTraveloguesList(data); })
      .catch(err => console.error("Error loading travelogues:", err));

    fetch("/api/photos")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPhotosList(data); })
      .catch(err => console.error("Error loading photos:", err));

    fetch("/api/bus-information").then(res => res.ok ? res.json() : []).then(data => { if (Array.isArray(data)) setBusInformation(data); }).catch(console.error);
    fetch("/api/busroutes")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBusRoutesList(data); })
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
              INTERACTIVE TRAVEL DESK
            </span>
          </div>
          <h2 lang="en" className="font-anek-english font-extrabold text-[#052962] text-2xl md:text-4.5xl leading-tight">
            EXPLORE ATTAPPADI VALLEY
          </h2>
          <p lang={lang} className={`text-xs md:text-sm text-gray-500 mt-2 max-w-3xl leading-relaxed ${lang === "ta" ? "font-anek-tamil" : lang === "ml" ? "font-anek-malayalam" : "font-anek-english"}`}>
            {lang === "en" 
              ? "Immerse yourself in India's richest biodiversity, pristine flowing rivers, spiritual peaks, rare tribal gastronomy, and organic eco-tourism experiences from Silent Valley to Sholayur."
              : lang === "ta" ? "சைலண்ட் வேலி முதல் சோலையூர் வரை அட்டப்பாடியின் பசுமையான காடுகள், ஆறுகள், புனித மலைச்சிகரங்கள், பழங்குடியின உணவு மரபுகள் மற்றும் இயற்கைச் சுற்றுலா அனுபவங்களை அறிந்துகொள்ளுங்கள்." : "സൈലന്റ് വാലി മുതൽ ഷോളയൂർ വരെയുള്ള അട്ടപ്പാടിയുടെ സമൃദ്ധമായ വനസംസ്കാരം, ഒഴുകുന്ന നിത്യഹരിത പുഴകൾ, ആത്മീയ കൊടുമുടികൾ, അപൂർവ ഗോത്രവിഭവങ്ങൾ, പ്രകൃതി സ്നേഹികളുടെ താമസ സൗകര്യങ്ങൾ എന്നിവ ഇവിടെ കണ്ടെത്താം."
            }
          </p>
        </div>
      )}

      {/* Modern Filter Strip */}
      {!hideTabsSelection && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
          {[
            { key: "destinations", labelEn: "Destinations", icon: <Compass className="w-3.5 h-3.5" /> },
            { key: "stays", labelEn: "Nature Stays", icon: <Hotel className="w-3.5 h-3.5" /> },
            { key: "travelogues", labelEn: "Travelogues", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { key: "photos", labelEn: "Photo Hub", icon: <ImageIcon className="w-3.5 h-3.5" /> }
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
                      {lang === "ml" ? dest.locationMl : lang === "ta" ? (((dest as any).locationTa) || dest.locationEn) : dest.locationEn}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-serif-guardian font-extrabold text-[#052962] text-lg md:text-xl">
                      {lang === "ml" ? dest.nameMl : lang === "ta" ? (((dest as any).nameTa) || dest.nameEn) : dest.nameEn}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      {lang === "ml" ? dest.descriptionMl : lang === "ta" ? (((dest as any).descriptionTa) || dest.descriptionEn) : dest.descriptionEn}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1">
                  <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-1.5">
                    {safeParseArray(lang === "ml" ? dest.highlightsMl : lang === "ta" ? (((dest as any).highlightsTa) || dest.highlightsEn) : dest.highlightsEn).map((highlight, index) => (
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
                      {cult.type === "food" ? (lang !== "ml" ? "Gastronomy" : "ഭക്ഷണപാരമ്പര്യം") : (lang !== "ml" ? "Arts & Heritage" : "കലയും സംസ്‌കാരവും")}
                    </span>
                    <h3 className="font-serif-guardian font-extrabold text-slate-900 text-lg md:text-xl pt-1">
                      {lang === "ml" ? cult.titleMl : lang === "ta" ? (((cult as any).titleTa) || cult.titleEn) : cult.titleEn}
                    </h3>
                    <h5 className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                      {lang === "ml" ? cult.subtitleMl : lang === "ta" ? (((cult as any).subtitleTa) || cult.subtitleEn) : cult.subtitleEn}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {lang === "ml" ? cult.descMl : lang === "ta" ? (((cult as any).descTa) || cult.descEn) : cult.descEn}
                    </p>
                  </div>
                  <div className="bg-[#052962]/5 border-l-4 border-[#052962] p-2.5 rounded-r">
                    <p className="text-[11px] font-bold text-[#052962] flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
                      {lang === "ml" ? cult.elementMl : lang === "ta" ? (((cult as any).elementTa) || cult.elementEn) : cult.elementEn}
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
                      {lang === "ml" ? stay.typeMl : lang === "ta" ? (((stay as any).typeTa) || stay.typeEn) : stay.typeEn}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {lang === "ml" ? stay.locationMl : lang === "ta" ? (((stay as any).locationTa) || stay.locationEn) : stay.locationEn}
                    </span>
                    <h4 className="font-serif-guardian font-bold text-gray-800 text-sm md:text-base leading-snug">
                      {lang === "ml" ? stay.nameMl : lang === "ta" ? (((stay as any).nameTa) || stay.nameEn) : stay.nameEn}
                    </h4>
                    <ul className="space-y-1 pt-1.5">
                      {(() => {
                        const featsEn = safeParseArray(stay.featuresEn);
                        const featsMl = safeParseArray(stay.featuresMl);
                        return featsEn.map((feat, fIdx) => (
                          <li key={fIdx} className="text-[10px] text-gray-400 flex items-center gap-1">
                            <span className="text-emerald-600 font-black">✔</span>
                            {lang === "ml" ? (featsMl[fIdx] || feat) : lang === "ta" ? (((stay as any).featuresTa?.[fIdx]) || feat) : feat}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{lang === "ta" ? "மதிப்பிடப்பட்ட கட்டணம்" : lang === "ml" ? "നിരക്ക്" : "Rate Estimate"}</span>
                  <span className="text-xs font-black text-[#c70000]">{lang === "ml" ? stay.priceMl : lang === "ta" ? (((stay as any).priceTa) || stay.priceEn) : stay.priceEn}</span>
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
                      {lang !== "ml" ? "Bilingual Narrative" : "യാത്രാക്കുറിപ്പ്"}
                    </span>
                    <h3 className="font-serif-guardian font-extrabold text-gray-900 text-lg md:text-xl">
                      {lang === "ml" ? tr.titleMl : lang === "ta" ? (((tr as any).titleTa) || tr.titleEn) : tr.titleEn}
                    </h3>
                  </div>
                  <span className="text-[10px] whitespace-nowrap text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {lang === "ml" ? tr.readTimeMl : lang === "ta" ? (((tr as any).readTimeTa) || tr.readTimeEn) : tr.readTimeEn}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-light italic">
                  "{lang === "ml" ? tr.snippetMl : lang === "ta" ? (((tr as any).snippetTa) || tr.snippetEn) : tr.snippetEn}"
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <span>
                    By <strong className="text-gray-600">{lang === "ml" ? tr.authorMl : lang === "ta" ? (((tr as any).authorTa) || tr.authorEn) : tr.authorEn}</strong>
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
                      <p className="font-bold truncate">{lang === "ml" ? ph.titleMl : lang === "ta" ? (((ph as any).titleTa) || ph.titleEn) : ph.titleEn}</p>
                      <p className="text-slate-300 text-[8px] truncate">{lang === "ta" ? "பெரிதாகப் பார்க்கத் தொடவும்" : lang === "ml" ? "വലുതാക്കി കാണാൻ ക്ലിക്ക് ചെയ്യുക" : "Click to expand"}</p>
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
                        {lang === "ta" ? `படம் ${selectedPhotoIndex + 1} / ${photosList.length}` : lang === "ml" ? `ചിത്രം ${selectedPhotoIndex + 1} / ${photosList.length}` : `Photo ${selectedPhotoIndex + 1} of ${photosList.length}`}
                      </span>
                      <h4 className="font-serif-guardian font-extrabold text-base md:text-xl text-[#ffe500]">
                        {lang === "ml" ? photosList[selectedPhotoIndex].titleMl : lang === "ta" ? (((photosList[selectedPhotoIndex] as any).titleTa) || photosList[selectedPhotoIndex].titleEn) : photosList[selectedPhotoIndex].titleEn}
                      </h4>
                      <p className="text-xs text-slate-300 font-light max-w-lg mx-auto">
                        {lang === "ml" ? photosList[selectedPhotoIndex].descMl : lang === "ta" ? (((photosList[selectedPhotoIndex] as any).descTa) || photosList[selectedPhotoIndex].descEn) : photosList[selectedPhotoIndex].descEn}
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

          // Tamil names for legacy stops that predate the nameTa database field.
          // Firestore/admin-provided Tamil always takes precedence over these defaults.
          const tamilStopDefaults: Record<string, string> = {
            KOZHIKODE: "கோழிக்கோடு", MANJERI: "மஞ்சேரி", GURUVAYUR: "குருவாயூர்",
            THRISSUR: "திருச்சூர்", KOTTAYAM: "கோட்டயம்", KATTAPPANA: "கட்டப்பனை",
            SHORNUR: "ஷோரனூர்", CHERPULASSERY: "செர்ப்புளச்சேரி",
            PERINTHALMANNA: "பெரிந்தல்மண்ணா", PALAKKAD: "பாலக்காடு",
            MANNARKKAD: "மண்ணார்க்காடு", MUKKALI: "முக்காலி",
            THAVALAM: "தாவளம்", GOOLIKKADAVU: "கூலிக்கடவு",
            AGALI: "அகளி", JELLIPPARA: "ஜெல்லிப்பாறை", PALOOR: "பாலூர்",
            PUDUR: "புதூர்", CHITTUR: "சித்தூர்", MULLI: "முள்ளி",
            SHOLAYUR: "சோலையூர்", ANAIKKATTY: "ஆனைக்கட்டி",
            METTUPALAYAM: "மேட்டுப்பாளையம்", COIMBATORE: "கோயம்புத்தூர்",
            KOTTATHARA: "கோட்டத்தறை", PATTAMBI: "பட்டாம்பி", PALA: "பாலா"
          };
          const tamilStopName = (id: string, saved?: string) =>
            saved?.trim() || tamilStopDefaults[normalizeStopName(id)] || id;

          // Define all unique stops for dropdown choices mapped dynamically from state
          const stopChoices = [
            ...mapNodes.map(node => ({ id: node.id, en: node.nameEn, ml: node.nameMl, ta: tamilStopName(node.id, node.nameTa) })),
            ...busRoutesList.flatMap(route => route.list).filter(stop =>
              !mapNodes.some(node => normalizeStopName(node.id) === normalizeStopName(stop.typeEn))
            ).filter((stop, index, all) =>
              all.findIndex(item => normalizeStopName(item.typeEn) === normalizeStopName(stop.typeEn)) === index
            ).map(stop => ({
              id: normalizeStopName(stop.typeEn),
              en: stop.typeEn,
              ml: stop.typeMl,
              ta: tamilStopName(stop.typeEn, (stop as any).typeTa)
            }))
          ];

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
            <div lang={lang} className={`space-y-6 animate-fade-in ${lang === "ta" ? "font-anek-tamil" : lang === "ml" ? "font-anek-malayalam" : "font-anek-english"}`}>
              
              {/* Disclaimer and Help Desk Box */}
              <div className="bg-[#052962]/5 border-l-4 border-[#052962] p-4 rounded-r-md flex gap-3 text-xs text-[#052962]" style={{ contentVisibility: 'auto' }}>
                <Info className="w-5 h-5 text-[#052962] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p lang="en" className="font-anek-english font-extrabold text-[13px] text-[#052962]">
                    ATTAPPADI TRANSIT HELP
                  </p>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                    {lang === "ta" ? "மலைப்பாதையில் பனிமூட்டம், கனமழை மற்றும் வனப்பகுதி நேரக் கட்டுப்பாடுகள் காரணமாக பேருந்து நேரங்களில் மாற்றம் ஏற்படலாம். உறுதியான தகவல்களுக்கு கே.எஸ்.ஆர்.டி.சி உதவி எண்ணைத் தொடர்புகொள்ளவும்." : lang === "ml" ? "ചുരം റോഡിലെ മൂടൽമഞ്ഞ്, കനത്ത മഴ, വനമേഖലയിലെ സമയനിയന്ത്രണങ്ങൾ എന്നിവ കാരണം ബസ് സമയങ്ങളിൽ മാറ്റമുണ്ടാകാം. കൃത്യമായ വിവരങ്ങൾക്ക് കെ.എസ്.ആർ.ടി.സി ഹെൽപ്പ് നമ്പറിൽ ബന്ധപ്പെടുക." : "Fog, heavy rain and forest-area restrictions may affect bus schedules. Contact KSRTC for confirmed timings."} ({lang === "ta" ? "அகளி பேருந்து நிலையம்" : lang === "ml" ? "അഗളി ബസ് സ്റ്റേഷൻ" : "Agali Bus Station"}: <span className="font-bold underline text-[#052962]">04924-254400</span>)
                  </p>
                </div>
              </div>

              {/* Blue information ticker, managed separately in Bus Timings admin. */}
              {busInformation.length > 0 && (
                <div className="flex items-stretch overflow-hidden rounded-xl border border-blue-200 bg-blue-50 shadow-sm" role="region" aria-label="Bus information updates">
                  <div className="flex shrink-0 items-center gap-2 bg-[#0757a6] px-4 py-3 text-white">
                    <Info className="h-5 w-5" />
                    <span lang="en" className="font-anek-english text-xs font-black tracking-wide">BUS INFORMATION</span>
                  </div>
                  <div className="relative flex min-w-0 flex-1 items-center overflow-hidden py-3">
                    <div className="bus-info-scroll flex w-max items-center gap-12 whitespace-nowrap px-4 text-sm font-bold text-[#073b76] motion-reduce:animate-none">
                      {[...busInformation, ...busInformation].map((item, idx) => (
                        <span key={item.id + "-" + idx} lang={lang} className={lang === "ta" ? "font-anek-tamil" : lang === "ml" ? "font-anek-malayalam" : "font-anek-latin"}>
                          {lang === "ta" ? item.contentTa : lang === "ml" ? item.contentMl : item.contentEn}
                        </span>
                      ))}
                    </div>
                  </div>
                  <style>{`@keyframes busInfoMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } } .bus-info-scroll { animation: busInfoMarquee 28s linear infinite; } .bus-info-scroll:hover { animation-play-state: paused; } @media (prefers-reduced-motion: reduce) { .bus-info-scroll { animation: none; white-space: normal; flex-wrap: wrap; } }`}</style>
                </div>
              )}

              {/* Colour-coded responsive navigation cards; titles remain English in every language. */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "stop", label: "SELECT STATION", subtitle: "Station timetables", icon: <MapPin className="w-5 h-5" />, active: "border-blue-600 bg-blue-600 text-white shadow-blue-200", idle: "border-blue-100 bg-blue-50 text-blue-900 hover:bg-blue-100", iconActive: "bg-white/20", iconIdle: "bg-blue-100 text-blue-700" },
                  { key: "directions", label: "SEARCH BY BUS OR TRIP", subtitle: "Find routes & timings", icon: <Search className="w-5 h-5" />, active: "border-violet-600 bg-violet-600 text-white shadow-violet-200", idle: "border-violet-100 bg-violet-50 text-violet-900 hover:bg-violet-100", iconActive: "bg-white/20", iconIdle: "bg-violet-100 text-violet-700" },
                  { key: "assist", label: "TOURIST DESTINATIONS", subtitle: "Explore Attappadi", icon: <Compass className="w-5 h-5" />, active: "border-emerald-600 bg-emerald-600 text-white shadow-emerald-200", idle: "border-emerald-100 bg-emerald-50 text-emerald-900 hover:bg-emerald-100", iconActive: "bg-white/20", iconIdle: "bg-emerald-100 text-emerald-700" }
                ].map((m) => {
                  const selected = busTimingMode === m.key;
                  return (
                    <button key={m.key} type="button" onClick={() => setBusTimingMode(m.key as any)}
                      aria-pressed={selected}
                      className={`min-w-0 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200 cursor-pointer flex items-center gap-3 ${selected ? `${m.active} shadow-lg -translate-y-0.5` : m.idle}`}>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? m.iconActive : m.iconIdle}`}>{m.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span lang="en" className="block font-anek-english font-black text-sm leading-tight tracking-wide">{m.label}</span>
                        <span lang="en" className={`block font-anek-english text-[11px] mt-1 ${selected ? "text-white/85" : "opacity-70"}`}>{m.subtitle}</span>
                      </span>
                      {selected && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* On desktop, show the OSM map beside the timetable station selector. Stack on mobile. */}
              <div className={busTimingMode === "stop" ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "block"}>
                {busTimingMode === "stop" && <div className="lg:col-span-7 min-w-0 lg:sticky lg:top-4">
                  <BusStopOSMMap isAdmin={isAdmin} stops={stopChoices} selectedStop={selectedMapStop} onSelectStop={(id) => { setSelectedMapStop(id); setBusTimingMode("stop"); window.setTimeout(() => document.getElementById("attappadi-station-board")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120); }} lang={lang} />
                </div>}

              {/* Master Responsive Layout split into sidebar panel & Vector Map */}
              <div className={busTimingMode === "stop" ? "lg:col-span-5 min-w-0 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start" : "w-full min-w-0 grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"}>
                
                {/* Visual Map widget - Highlight of modern responsive interface */}
                <div className={isAdmin && busTimingMode === "stop" ? "xl:col-span-5 order-first xl:order-last space-y-4" : "hidden"}>
                  <div className="bg-[#eef2ef] border border-slate-300 rounded-xl p-4 shadow-sm relative overflow-hidden select-none">
                    
                    {/* Header Map indicators */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 bg-white/70 backdrop-blur-xs p-2.5 rounded-lg">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">
                          INTERACTIVE GEOGRAPHIC MAP
                        </span>
                        <h5 className="font-extrabold text-[#052962] text-xs">
                          Attappadi Bus Network
                        </h5>
                      </div>
                      
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
                                className="font-inherit select-none"
                              >
                                {lang === "ml" ? node.nameMl : lang === "ta" ? (((node as any).nameTa) || node.nameEn) : node.nameEn}
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
                      <div className="bg-slate-900 text-slate-100 border border-slate-950 rounded-xl p-4 shadow-xl space-y-4 animate-fade-in mt-4 text-left">
                        <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={chartSaving || !chartLoaded} onClick={() => void saveStationChart()} className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{chartSaving ? "Saving…" : "Save chart & branches to database"}</button>{chartMessage && <span role="status" className="text-xs text-amber-300">{chartMessage}</span>}</div>
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

                                  <label className="flex items-center gap-2 text-[11px] text-slate-300"><input type="checkbox" checked={stationAutoTranslate} onChange={e => setStationAutoTranslate(e.target.checked)} /> Auto Translate missing station names</label>
                                  <div className="grid grid-cols-1 gap-2 text-left">
                                    {(["ml", "en", "ta"] as const).map(language => {
                                      const field = language === "ml" ? "nameMl" : language === "en" ? "nameEn" : "nameTa";
                                      return <div key={language}><label className="block text-[10px] text-slate-400 font-bold mb-1">{language === "ml" ? "Malayalam" : language === "en" ? "English" : "Tamil"} Name</label>
                                        <input lang={language} value={activeNode[field] || ""} onChange={e => { const value = e.target.value; setMapNodes(prev => prev.map(n => n.id === activeNode.id ? { ...n, [field]: value } : n)); }}  className={`w-full bg-slate-950 border border-slate-800 px-2 py-2 rounded text-slate-200 text-xs font-bold ${language === "ml" ? "font-anek-malayalam" : language === "ta" ? "font-anek-tamil" : "font-anek-latin"}`} />
                                      </div>;
                                    })}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(["ml", "en", "ta"] as const).map(source => (
                                      <button key={source} type="button" disabled={stationTranslationBusy || !stationAutoTranslate}
                                        onClick={async () => {
                                          const current = mapNodes.find(n => n.id === activeNode.id);
                                          if (!current) return;
                                          const sourceField = source === "ml" ? "nameMl" : source === "en" ? "nameEn" : "nameTa";
                                          if (!current[sourceField]?.trim()) { alert("Enter the source station name first."); return; }
                                          const translated = await translateStationNames({ nameMl: current.nameMl || "", nameEn: current.nameEn || "", nameTa: current.nameTa || "" }, source);
                                          setMapNodes(previous => previous.map(node => node.id === current.id ? {
                                            ...node,
                                            nameMl: node.nameMl?.trim() || translated.nameMl,
                                            nameEn: node.nameEn?.trim() || translated.nameEn,
                                            nameTa: node.nameTa?.trim() || translated.nameTa || ""
                                          } : node));
                                        }}
                                        className="rounded bg-slate-700 px-2 py-1.5 text-[10px] font-bold text-white disabled:opacity-50">
                                        Translate from {source === "ml" ? "Malayalam" : source === "en" ? "English" : "Tamil"}
                                      </button>
                                    ))}
                                  </div>
                                  <button type="button" disabled={chartSaving || !chartLoaded} onClick={() => void saveStationChart()} className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{chartSaving ? "Saving…" : "Save station translations to database"}</button>
                                  <p className="text-[10px] text-slate-400">Tamil can be entered manually. Saving updates the shared chart for website and Android admins.</p>
                                  {stationTranslationBusy && <p className="text-xs text-amber-400">Translating station names…</p>}{chartMessage && <p role="status" className="text-xs text-amber-400">{chartMessage}</p>}

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
                                <div className="space-y-2 rounded border border-slate-700 p-2"><label className="flex items-center gap-2 text-[11px] font-bold text-slate-200"><input type="checkbox" checked={stationAutoTranslate} onChange={e=>setStationAutoTranslate(e.target.checked)} /> Auto Translate missing station names</label><p className="text-[10px] text-slate-400">Enter names manually in any language, or translate empty fields from a selected language. Existing text is never overwritten.</p><div className="grid grid-cols-1 gap-2"><label className="block text-[10px] font-bold text-slate-300">Malayalam<input id="new-hub-ml" lang="ml" type="text" placeholder="പാലൂർ കിഴക്ക്" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white font-anek-malayalam" /></label><label className="block text-[10px] font-bold text-slate-300">English<input id="new-hub-en" lang="en" type="text" placeholder="Paloor East" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white font-anek-latin" /></label><label className="block text-[10px] font-bold text-slate-300">Tamil<input id="new-hub-ta" lang="ta" type="text" placeholder="பாலூர் கிழக்கு" className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white font-anek-tamil" /></label></div><div className="flex flex-wrap gap-1.5"><button type="button" disabled={stationTranslationBusy} onClick={async()=>{const en=document.getElementById("new-hub-en") as HTMLInputElement;const ml=document.getElementById("new-hub-ml") as HTMLInputElement;const ta=document.getElementById("new-hub-ta") as HTMLInputElement;const names={nameEn:en.value.trim(),nameMl:ml.value.trim(),nameTa:ta.value.trim()};if(!names.nameMl){alert("Enter a Malayalam station name first.");return;}const translated=await translateStationNames(names,"ml");en.value=translated.nameEn;ml.value=translated.nameMl;ta.value=translated.nameTa||"";}} className="rounded bg-slate-700 px-2 py-1.5 text-[10px] font-bold text-white disabled:opacity-50">Translate from Malayalam</button><button type="button" disabled={stationTranslationBusy} onClick={async()=>{const en=document.getElementById("new-hub-en") as HTMLInputElement;const ml=document.getElementById("new-hub-ml") as HTMLInputElement;const ta=document.getElementById("new-hub-ta") as HTMLInputElement;const names={nameEn:en.value.trim(),nameMl:ml.value.trim(),nameTa:ta.value.trim()};if(!names.nameEn){alert("Enter a English station name first.");return;}const translated=await translateStationNames(names,"en");en.value=translated.nameEn;ml.value=translated.nameMl;ta.value=translated.nameTa||"";}} className="rounded bg-slate-700 px-2 py-1.5 text-[10px] font-bold text-white disabled:opacity-50">Translate from English</button><button type="button" disabled={stationTranslationBusy} onClick={async()=>{const en=document.getElementById("new-hub-en") as HTMLInputElement;const ml=document.getElementById("new-hub-ml") as HTMLInputElement;const ta=document.getElementById("new-hub-ta") as HTMLInputElement;const names={nameEn:en.value.trim(),nameMl:ml.value.trim(),nameTa:ta.value.trim()};if(!names.nameTa){alert("Enter a Tamil station name first.");return;}const translated=await translateStationNames(names,"ta");en.value=translated.nameEn;ml.value=translated.nameMl;ta.value=translated.nameTa||"";}} className="rounded bg-slate-700 px-2 py-1.5 text-[10px] font-bold text-white disabled:opacity-50">Translate from Tamil</button></div>{stationTranslationBusy&&<p className="text-xs text-amber-400">Translating station names…</p>}</div>
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
                                  onClick={async () => {
                                    const idInput = document.getElementById("new-hub-id") as HTMLInputElement;
                                    const enInput = document.getElementById("new-hub-en") as HTMLInputElement;
                                    const mlInput = document.getElementById("new-hub-ml") as HTMLInputElement;
                                    const taInput = document.getElementById("new-hub-ta") as HTMLInputElement;
                                    const xInput = document.getElementById("new-hub-x") as HTMLInputElement;
                                    const yInput = document.getElementById("new-hub-y") as HTMLInputElement;

                                    const id = idInput?.value.trim().toUpperCase();
                                    const nameEn = enInput?.value.trim();
                                    const nameMl = mlInput?.value.trim();
                                    const nameTa = taInput?.value.trim();
                                    const xVal = xInput?.value ? parseInt(xInput.value) : 50;
                                    const yVal = yInput?.value ? parseInt(yInput.value) : 50;

                                    if (!id || !(nameEn || nameMl || nameTa)) {
                                      alert("Please fill in all layout fields to create a custom station.");
                                      return;
                                    }
                                    if (mapNodes.some(n => n.id === id)) {
                                      alert("A station with this Unique ID already exists.");
                                      return;
                                    }

                                    const translatedNames = await translateStationNames({ nameEn, nameMl, nameTa }, nameMl ? "ml" : nameEn ? "en" : "ta");
                                    if (!translatedNames.nameEn || !translatedNames.nameMl || !translatedNames.nameTa) { alert("Please provide all three station names or enable Auto Translate."); return; }
                                    const newNode = { id, x: xVal, y: yVal, ...translatedNames };
                                    const updated = [...mapNodes, newNode];
                                    setMapNodes(updated);
                                    localStorage.setItem("attappadi_map_nodes2", JSON.stringify(updated));
                                    setSelectedEditorNodeId(id);

                                    // Reset fields
                                    if (idInput) idInput.value = "";
                                    if (enInput) enInput.value = "";
                                    if (mlInput) mlInput.value = "";
                                    if (taInput) taInput.value = "";
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
                <div className={isAdmin ? "xl:col-span-7 space-y-5 min-w-0" : "xl:col-span-12 space-y-5 min-w-0"}>
                  
                  {/* Mode 1: HUB STATION DEPARTURE SCHEDULES */}
                  {busTimingMode === "stop" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm animate-fade-in">
                      
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#052962]/5 text-[#052962] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                          HUB STATION SELECTOR
                        </span>
                        <h4 lang="en" className="font-anek-english font-black text-[#052962] text-xl leading-snug">Station-wise Bus Timetables</h4>
                      </div>

                      {/* Selector grid or list */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          {lang === "ta" ? "கீழே உள்ள பட்டியலில் இருந்து பேருந்து நிலையத்தைத் தேர்ந்தெடுக்கவும்:" : lang === "ml" ? "താഴെ നൽകിയതിൽ നിന്നും സ്റ്റേഷൻ തിരഞ്ഞെടുക്കുക:" : "Select a bus station from the list below:"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-2 select-none">
                          {stopChoices.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => setSelectedMapStop(st.id)}
                              className={`min-w-0 w-full min-h-10 px-2 py-2 rounded-lg text-[11px] leading-snug font-black whitespace-normal wrap-break-word transition text-center cursor-pointer border ${
                                selectedMapStop === st.id
                                  ? "bg-[#052962] text-white border-[#052962] shadow-xs"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {lang === "ml" ? st.ml : lang === "ta" ? st.ta : st.en}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display results */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2 pt-2 border-slate-100">
                          <h5 className="font-bold text-[#052962] text-xs leading-none flex items-center gap-1">
                            <span>{lang === "ta" ? "🕒 புறப்படும் இடம்:" : lang === "ml" ? "🕒 പുറപ്പെടുന്ന സ്ഥലം:" : "🕒 Departures from:"}</span>
                            <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded text-[11px] font-black">
                              {lang === "ml" ? currentMapStopEntity.ml : lang === "ta" ? currentMapStopEntity.ta : currentMapStopEntity.en}
                            </span>
                          </h5>
                          <span className="text-[10.5px] font-black text-slate-400">
                            {lang === "ta" ? `${stopDepartures.length} பேருந்து சேவைகள் கண்டறியப்பட்டன` : lang === "ml" ? `${stopDepartures.length} ട്രിപ്പുകൾ കണ്ടെത്തി` : `${stopDepartures.length} trips found`}
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
                                        {lang === "ml" ? item.routeMl : lang === "ta" ? (((item as any).routeTa) || item.routeEn) : item.routeEn}
                                      </h6>
                                      <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wide">
                                        {lang === "ml" ? item.busTypeMl : lang === "ta" ? (((item as any).busTypeTa) || item.busTypeEn) : item.busTypeEn}
                                      </p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border uppercase ${badgeClass}`}>
                                      {item.typeLabel === "PRIVATE" && item.privateBusName ? item.privateBusName : item.typeLabel}
                                    </span>
                                  </div>

                                  {isAdmin && <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => onEditBusRoute?.(item.routeId)} className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-900">Edit trip & stops</button>
                                    <button type="button" onClick={() => onDeleteBusRoute?.(item.routeId)} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-800">Delete trip</button>
                                    <span className="self-center text-[10px] text-slate-500">Deleting removes the source timetable and its derived station cards.</span>
                                  </div>}
                                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-150">
                                    <div className="text-[11px]">
                                      <span className="text-slate-400 font-bold block text-[9px] uppercase leading-none">DESTINATION TIMING</span>
                                      <span className="font-extrabold text-[#052962]">
                                        Heading directly to: <strong className="text-red-700">{lang === "ml" ? item.headingToMl : lang === "ta" ? (((item as any).headingToTa) || item.headingToEn) : item.headingToEn.toUpperCase()}</strong>
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
                                  <div className="flex items-center gap-1 py-1 overflow-x-auto text-[9.5px] font-bold text-slate-400 whitespace-nowrap">
                                    {item.fullList.map((stopItem, sIdx) => {
                                      const isSelf = normalizeStopName(stopItem.typeEn) === normalizeStopName(selectedMapStop);
                                      return (
                                        <div key={sIdx} className="flex items-center gap-1 shrink-0 last:mr-0 mr-1.5">
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${isSelf ? "bg-[#052962] text-white font-black" : "bg-slate-200 text-slate-600 font-medium"}`}>
                                            {stopItem.time} {lang === "ml" ? stopItem.typeMl : lang === "ta" ? (((stopItem as any).typeTa) || stopItem.typeEn) : stopItem.typeEn.toUpperCase()}
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
                            <p className="text-xs text-slate-400 font-medium">
                              {lang === "ta" ? "இந்த நிலையத்திற்கான பேருந்து நேர அட்டவணை தற்போது இல்லை. வேறொரு நிலையத்தைத் தேர்ந்தெடுக்கவும்." : lang === "ml" ? "ഈ സ്റ്റേഷനിൽ പ്രധാന സമയ സർവീസുകളൊന്നും നിശ്ചയിച്ചിട്ടില്ല. മറ്റൊരു സ്റ്റേഷൻ നോക്കൂ." : "No scheduled bus services are available for this station. Please select another station."}
                            </p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Mode 2: Search existing admin-managed buses and trips by name, route or number. */}
                  {busTimingMode === "directions" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 lang="en" className="font-anek-english font-black text-[#052962] text-xl">SEARCH BY BUS OR TRIP</h4>
                      <label className="block text-xs font-bold text-slate-600">
                        {lang === "ta" ? "பேருந்தின் பெயர், எண் அல்லது வழித்தடத்தைத் தேடுங்கள்" : lang === "ml" ? "ബസിന്റെ പേര്, നമ്പർ അല്ലെങ്കിൽ റൂട്ട് തിരയുക" : "Search by bus name, number or route"}
                      </label>
                      <input type="search" value={busNameQuery} onChange={e => setBusNameQuery(e.target.value)}
                        placeholder={lang === "ta" ? "பேருந்து பெயர் / எண் / வழித்தடம்" : lang === "ml" ? "ബസ് പേര് / നമ്പർ / റൂട്ട്" : "Bus name / number / route"}
                        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#052962]" />
                      {(() => {
                        const q = busNameQuery.trim().toLocaleLowerCase();
                        const matches = q ? busRoutesList.filter(route => [
                          route.id, route.routeEn, route.routeMl, route.routeTa, route.privateBusName,
                          route.busTypeEn, route.busTypeMl, route.busTypeTa, route.type,
                          ...(route.list || []).flatMap(stop => [stop.typeEn, stop.typeMl, stop.typeTa])
                        ].some(value => String(value || "").toLocaleLowerCase().includes(q))) : [];
                        return !q ? (
                          <p className="text-sm text-slate-500">{lang === "ta" ? "பேருந்து அல்லது வழித்தடத்தைத் தேட மேலே உள்ள பெட்டியில் உள்ளிடவும்." : lang === "ml" ? "ബസോ റൂട്ടോ കണ്ടെത്താൻ മുകളിൽ തിരയുക." : "Enter a bus name, number or route to find schedules."}</p>
                        ) : matches.length === 0 ? (
                          <p className="text-sm text-slate-500">{lang === "ta" ? "பொருத்தமான பேருந்து சேவைகள் இல்லை." : lang === "ml" ? "പൊരുത്തപ്പെടുന്ന ബസ് സർവീസുകളില്ല." : "No matching bus services found."}</p>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-500">{matches.length} {lang === "ta" ? "சேவைகள்" : lang === "ml" ? "സർവീസുകൾ" : "services found"}</p>
                            {matches.map(route => (
                              <div key={route.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                                <div className="flex flex-wrap justify-between gap-2">
                                  <h5 className="font-bold text-[#052962]">{lang === "ta" ? route.routeTa || route.routeEn : lang === "ml" ? route.routeMl : route.routeEn}</h5>
                                  <span className="text-xs font-bold">{route.privateBusName || route.type}</span>
                                </div>
                                <p className="text-xs text-slate-500">{lang === "ta" ? route.busTypeTa || route.busTypeEn : lang === "ml" ? route.busTypeMl : route.busTypeEn}</p>
                                <div className="flex flex-wrap gap-2">
                                  {(route.list || []).map((stop, idx) => (
                                    <div key={idx} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs">
                                      <strong className="block text-[#052962]">{stop.time}</strong>
                                      {lang === "ta" ? stop.typeTa || tamilStopName(stop.typeEn) : lang === "ml" ? stop.typeMl : stop.typeEn}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Mode 3: Only administrator-published destinations; no sample hotspots. */}
                  {busTimingMode === "assist" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                      <h4 lang="en" className="font-anek-english font-black text-[#052962] text-xl">TOURIST DESTINATIONS</h4>
                      {destinationsList.length === 0 ? (
                        <div className="min-h-44 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-500 text-center p-5">
                          {lang === "ta" ? "சுற்றுலாத் தலங்கள் இன்னும் சேர்க்கப்படவில்லை." : lang === "ml" ? "വിനോദസഞ്ചാര കേന്ദ്രങ്ങൾ ഇതുവരെ ചേർത്തിട്ടില്ല." : "No tourist destinations have been added yet."}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {destinationsList.map(destination => (
                            <article key={destination.id} className="rounded-xl border border-slate-200 overflow-hidden">
                              {destination.image && <img src={destination.image} alt={destination.nameEn} className="w-full h-40 object-cover" loading="lazy" />}
                              <div className="p-4 space-y-2">
                                <h5 className="font-bold text-[#052962]">{lang === "ta" ? destination.nameTa || destination.nameEn : lang === "ml" ? destination.nameMl : destination.nameEn}</h5>
                                <p className="text-xs text-slate-500">{lang === "ta" ? destination.locationTa || destination.locationEn : lang === "ml" ? destination.locationMl : destination.locationEn}</p>
                                <p className="text-sm text-slate-700">{lang === "ta" ? destination.descriptionTa || destination.descriptionEn : lang === "ml" ? destination.descriptionMl : destination.descriptionEn}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
              </div>

            </div>
          );
        })()}

      </div>

    </div>
  );
}
