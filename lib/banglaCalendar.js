const MONTHS = [
  { bn: "বৈশাখ", en: "Boishakh", days: 31 },
  { bn: "জ্যৈষ্ঠ", en: "Joishtho", days: 31 },
  { bn: "আষাঢ়", en: "Asharh", days: 31 },
  { bn: "শ্রাবণ", en: "Srabon", days: 31 },
  { bn: "ভাদ্র", en: "Bhadro", days: 31 },
  { bn: "আশ্বিন", en: "Ashwin", days: 31 },
  { bn: "কার্তিক", en: "Kartik", days: 30 },
  { bn: "অগ্রহায়ণ", en: "Ogrohayon", days: 30 },
  { bn: "পৌষ", en: "Poush", days: 30 },
  { bn: "মাঘ", en: "Magh", days: 30 },
  { bn: "ফাল্গুন", en: "Falgun", days: 29 },
  { bn: "চৈত্র", en: "Choitro", days: 30 },
];

const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  bn: ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"],
};

function isGregorianLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function toBnNumber(value) {
  return String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
}

/**
 * Bangladesh Bangla Academy civil calendar (Pohela Boishakh = 14 April).
 * West Bengal panjika dates can differ; this is the official BD version.
 */
export function gregorianToBangla(date) {
  if (!date || Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const newYearThis = Date.UTC(year, 3, 14);
  const instant = Date.UTC(year, date.getUTCMonth(), date.getUTCDate());
  const afterNewYear = instant >= newYearThis;
  const banglaYear = afterNewYear ? year - 593 : year - 594;
  const startYear = afterNewYear ? year : year - 1;
  const start = Date.UTC(startYear, 3, 14);
  const dayOfYear = Math.round((instant - start) / 86400000) + 1;
  const falgunDays = MONTHS[10].days + (isGregorianLeap(startYear + 1) ? 1 : 0);

  let remaining = dayOfYear;
  for (let i = 0; i < MONTHS.length; i += 1) {
    const dim = i === 10 ? falgunDays : MONTHS[i].days;
    if (remaining <= dim) {
      return {
        day: remaining,
        month: MONTHS[i],
        year: banglaYear,
        weekday: date.getUTCDay(),
      };
    }
    remaining -= dim;
  }
  return null;
}

export function formatBanglaCalendar(date, locale = "bn") {
  const bangla = gregorianToBangla(date);
  if (!bangla) return "—";
  const weekday = WEEKDAYS[locale === "en" ? "en" : "bn"][bangla.weekday];
  if (locale === "en") {
    return `${weekday}, ${bangla.day} ${bangla.month.en} ${bangla.year} BS`;
  }
  return `${weekday}, ${toBnNumber(bangla.day)} ${bangla.month.bn} ${toBnNumber(bangla.year)} বঙ্গাব্দ`;
}
