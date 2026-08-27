export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/settings", "/tracker", "/bookmarks"] },
    ],
    sitemap: "/sitemap.xml",
  };
}
