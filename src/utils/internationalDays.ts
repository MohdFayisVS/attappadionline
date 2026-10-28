/** Curated recurring international observances. Dates use India Standard Time. */
export const INTERNATIONAL_DAYS: Record<string, string> = {
  "01-04": "World Braille Day", "01-24": "International Day of Education",
  "02-04": "World Cancer Day", "02-11": "International Day of Women and Girls in Science",
  "02-20": "World Day of Social Justice", "02-21": "International Mother Language Day",
  "03-03": "World Wildlife Day", "03-08": "International Women's Day",
  "03-20": "International Day of Happiness", "03-21": "International Day of Forests",
  "03-22": "World Water Day", "03-24": "World Tuberculosis Day",
  "04-02": "World Autism Awareness Day", "04-07": "World Health Day",
  "04-22": "International Mother Earth Day", "04-23": "World Book and Copyright Day",
  "05-01": "International Workers' Day", "05-03": "World Press Freedom Day",
  "05-15": "International Day of Families", "05-22": "International Day for Biological Diversity",
  "05-31": "World No Tobacco Day", "06-05": "World Environment Day",
  "06-08": "World Oceans Day", "06-12": "World Day Against Child Labour",
  "06-14": "World Blood Donor Day", "06-20": "World Refugee Day",
  "06-21": "International Day of Yoga", "06-26": "International Day Against Drug Abuse",
  "07-11": "World Population Day", "07-18": "Nelson Mandela International Day",
  "07-28": "World Hepatitis Day", "08-09": "International Day of the World's Indigenous Peoples",
  "08-12": "International Youth Day", "08-19": "World Humanitarian Day",
  "09-05": "International Day of Charity", "09-08": "International Literacy Day",
  "09-15": "International Day of Democracy", "09-21": "International Day of Peace",
  "09-27": "World Tourism Day", "10-01": "International Day of Older Persons",
  "10-02": "International Day of Non-Violence", "10-05": "World Teachers' Day",
  "10-10": "World Mental Health Day", "10-11": "International Day of the Girl Child",
  "10-16": "World Food Day", "10-24": "United Nations Day",
  "10-31": "World Cities Day", "11-10": "World Science Day for Peace and Development",
  "11-14": "World Diabetes Day", "11-16": "International Day for Tolerance",
  "11-19": "World Toilet Day", "11-20": "World Children's Day",
  "11-25": "International Day for the Elimination of Violence against Women",
  "12-01": "World AIDS Day", "12-03": "International Day of Persons with Disabilities",
  "12-05": "World Soil Day", "12-10": "Human Rights Day",
  "12-18": "International Migrants Day", "12-20": "International Human Solidarity Day"
};
export function getInternationalDay(date: Date): string | null {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return INTERNATIONAL_DAYS[`${month}-${day}`] || null;
}
