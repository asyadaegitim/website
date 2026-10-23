// Preview only: serve the approved GitHub development branch without altering production.
// Intentionally *not* a production architecture. No API credentials or write access.
const BRANCH_RAW = "https://raw.githubusercontent.com/asyadaegitim/website/develop/site-foundation-20261023/dist";
const CONTENT_TYPES = {
  html: "text/html; charset=utf-8", css: "text/css; charset=utf-8",
  js: "application/javascript; charset=utf-8", svg: "image/svg+xml",
  json: "application/json; charset=utf-8", jpg: "image/jpeg",
  jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  ico: "image/x-icon", txt: "text/plain; charset=utf-8",
  woff: "font/woff", woff2: "font/woff2"
};
addEventListener("fetch", event => event.respondWith(handle(event.request)));
async function handle(request) {
  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response("Method not allowed", {status: 405});
  }
  const url = new URL(request.url);
  if (url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      headers: {"Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex, nofollow"}
    });
  }
  let path;
  try { path = decodeURIComponent(url.pathname); }
  catch { return new Response("Invalid path", {status: 400}); }
  // Forbid traversal, backslashes, and cross-origin redirects.
  if (path.includes("\\") || path.split("/").includes("..") || path.startsWith("//")) {
    return new Response("Invalid path", {status: 400});
  }
  if (path.endsWith("/") || !/\.[a-z0-9]+$/i.test(path)) {
    path = path.replace(/\/?$/, "/index.html");
  }
  const source = BRANCH_RAW + path;
  try {
    const upstream = await fetch(source + "?preview_rev=" + Math.floor(Date.now() / 15000), {redirect: "follow", cf: {cacheTtl: 0, cacheEverything: false}});
    const ext = path.split(".").pop().toLowerCase();
    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[ext] || upstream.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Preview-Branch": "develop/site-foundation-20261023"
    });
    return new Response(request.method === "HEAD" ? null : upstream.body, {status: upstream.status, headers});
  } catch {
    return new Response("GitHub preview source unavailable", {status: 502,
      headers: {"Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex"}});
  }
}
