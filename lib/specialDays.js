import { gregorianToBangla } from "@/lib/banglaCalendar";

const HIJRI_EVENTS = [
  { hijriMonth: 1, hijriDay: 1, id: "islamic_new_year", name: { en: "Islamic New Year", bn: "হিজরি নববর্ষ" } },
  { hijriMonth: 1, hijriDay: 10, id: "ashura", name: { en: "Day of Ashura", bn: "আশুরা" } },
  { hijriMonth: 3, hijriDay: 12, id: "mawlid", name: { en: "Mawlid (observed by some communities)", bn: "ঈদে মিলাদুন্নবী" } },
  { hijriMonth: 7, hijriDay: 27, id: "isra", name: { en: "Isra and Mi'raj (often observed)", bn: "শাব-এ-মিরাজ" } },
  { hijriMonth: 8, hijriDay: 15, id: "shaban", name: { en: "Mid-Sha'ban", bn: "শবে বরাত" } },
  { hijriMonth: 9, hijriDay: 1, id: "ramadan_start", name: { en: "Ramadan begins", bn: "রমজান শুরু" } },
  { hijriMonth: 9, hijriDay: 27, id: "laylatul_qadr", name: { en: "Laylatul Qadr (27th commonly hoped)", bn: "লাইলাতুল কদর" } },
  { hijriMonth: 10, hijriDay: 1, id: "eid_fitr", name: { en: "Eid al-Fitr", bn: "ঈদুল ফিতর" } },
  { hijriMonth: 12, hijriDay: 9, id: "arafah", name: { en: "Day of Arafah", bn: "আরাফার দিন" } },
  { hijriMonth: 12, hijriDay: 10, id: "eid_adha", name: { en: "Eid al-Adha", bn: "ঈদুল আজহা" } },
];

export function specialDayFor({ hijri, date, locale = "en" }) {
  const bn = locale === "bn";
  const items = [];
  const month = Number(hijri?.month?.number);
  const day = Number(hijri?.day);
  const weekday = date instanceof Date && !Number.isNaN(date.getTime()) ? date.getUTCDay() : null;

  const event = HIJRI_EVENTS.find((e) => e.hijriMonth === month && e.hijriDay === day);
  if (event) items.push({ id: event.id, title: bn ? event.name.bn : event.name.en, tone: "gold" });

  for (const holiday of hijri?.holidays || []) {
    const label = String(holiday).trim();
    if (label && !items.some((item) => item.title.toLowerCase().includes(label.toLowerCase()))) {
      items.push({ id: `holiday-${label}`, title: label, tone: "gold" });
    }
  }

  if (weekday === 5 && !items.some((item) => item.id === "jumuah")) {
    items.push({
      id: "jumuah",
      title: bn ? "জুমুআ" : "Jumu'ah",
      note: bn ? "জুমুআর নামাজের দিন" : "Day of congregational Jumu'ah prayer",
      tone: "gold",
    });
  } else if (weekday === 4) {
    items.push({
      id: "jumuah-eve",
      title: bn ? "আগামীকাল জুমুআ" : "Jumu'ah is tomorrow",
      note: bn ? "শুক্রবার জুমুআর নামাজ" : "Friday is the day of Jumu'ah prayer",
      tone: "gold",
    });
  }

  if (month === 9 && day > 1 && day !== 27) {
    items.push({
      id: "ramadan",
      title: bn ? `রমজান ${day}` : `Ramadan ${day}`,
      note: bn ? "সিয়ামের মাস" : "A day of fasting",
      tone: "primary",
    });
  }

  if ([13, 14, 15].includes(day) && month !== 9 && month !== 10) {
    items.push({
      id: "white-days",
      title: bn ? "আইয়ামে বীয" : "Ayyam al-Beed",
      note: bn ? "১৩–১৫ তারিখ প্রায়ই নফল রোজার দিন" : "The 13th–15th are often observed as fasting days",
      tone: "primary",
    });
  }

  const bangla = gregorianToBangla(date);
  if (bangla?.day === 1 && bangla.month.en === "Boishakh") {
    items.push({
      id: "pohela",
      title: bn ? "পহেলা বৈশাখ" : "Pohela Boishakh",
      note: bn ? "বাংলা নববর্ষ" : "Bengali New Year",
      tone: "gold",
    });
  }

  return items[0] || null;
}
