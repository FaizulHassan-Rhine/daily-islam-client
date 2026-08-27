export default function manifest() {
  return {
    name: "Daily Islam",
    short_name: "Daily Islam",
    description: "A peaceful Islamic companion for prayer, Quran, and daily worship.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7FAF5",
    theme_color: "#315E4B",
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
