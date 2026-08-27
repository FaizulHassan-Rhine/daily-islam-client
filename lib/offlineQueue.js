const QUEUE_KEY = "di.offline.queue";
const QUEUEABLE = ["/prayer-logs", "/fasting", "/tasbih", "/bookmarks/", "/quran/progress", "/ramadan/progress"];

function load() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-80)));
}

export function isQueueable(config) {
  const method = String(config.method || "get").toUpperCase();
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) return false;
  const url = String(config.url || "");
  return QUEUEABLE.some((path) => url.includes(path));
}

export function enqueueRequest(config) {
  const items = load();
  items.push({
    method: config.method,
    url: config.url,
    data: config.data,
    params: config.params,
    at: Date.now(),
  });
  save(items);
}

export function queuedCount() {
  return load().length;
}

export async function flushQueue(client) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const items = load();
  if (!items.length) return 0;
  const remaining = [];
  let flushed = 0;
  for (const item of items) {
    try {
      await client.request({
        method: item.method,
        url: item.url,
        data: item.data,
        params: item.params,
      });
      flushed += 1;
    } catch {
      remaining.push(item);
    }
  }
  save(remaining);
  return flushed;
}
