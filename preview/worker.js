// Preview only: serve the approved GitHub development branch without altering production.
// Intentionally *not* a production architecture. No API credentials or write access.
const BASE_RAW = "https://raw.githubusercontent.com/asyadaegitim/website";
const BRANCH_REF = "https://api.github.com/repos/asyadaegitim/website/git/ref/heads/develop/site-foundation-20261023";
let versionMemo = {sha: null, at: 0, pending: null};
async function resolveRevision() {
  if (versionMemo.sha && Date.now() - versionMemo.at < 15000) return versionMemo.sha;
  if (versionMemo.pending) return versionMemo.pending;
  versionMemo.pending = (async () => {
    const res = await fetch(BRANCH_REF, {
      headers: {"Accept": "application/vnd.github+json", "User-Agent": "AsyadaEgitimPreview"},
      cf: {cacheTtl: 10, cacheEverything: true}
    });
    if (!res.ok) throw new Error("Cannot resolve preview revision");
    const ref = await res.json();
    const sha = ref.object && ref.object.sha;
    if (!sha || !/^[a-f0-9]{40}$/i.test(sha)) throw new Error("Bad revision");
    versionMemo.sha = sha;
    versionMemo.at = Date.now();
    return sha;
  })();
  try { return await versionMemo.pending; }
  finally { versionMemo.pending = null; }
}
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
  try {
    const revision = await resolveRevision();
    const source = BASE_RAW + "/" + revision + "/dist" + path;
    const upstream = await fetch(source, {redirect: "follow", cf: {cacheTtl: 3600, cacheEverything: true}});
    const ext = path.split(".").pop().toLowerCase();
    const headers = new Headers({
      "Content-Type": CONTENT_TYPES[ext] || upstream.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Preview-Branch": "develop/site-foundation-20261023",
      "X-Preview-Commit": revision
    });
    return new Response(request.method === "HEAD" ? null : upstream.body, {status: upstream.status, headers});
  } catch {
    return new Response("GitHub preview source unavailable", {status: 502,
      headers: {"Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex"}});
  }
}
