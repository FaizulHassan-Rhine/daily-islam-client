export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/quran", "/prayer", "/dua", "/hadith", "/names", "/calendar", "/zakat", "/qibla", "/tasbih", "/ramadan"];
  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
