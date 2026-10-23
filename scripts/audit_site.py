#!/usr/bin/env python3
"""Dependency-free internal-link and source-preservation preflight for static dist/.

This is not a visual snapshot test or an external factual accuracy audit.
Run: python3 scripts/audit_site.py
"""
from __future__ import annotations

import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent / "dist"
REQUIRED = [
    "index.html",
    "site.css",
    "site.js",
    "assets/asya-logo.svg",
    "ulkeler/cin/index.html",
    "ulkeler/hong-kong/index.html",
    "ulkeler/guney-kore/index.html",
    "ulkeler/japonya/index.html",
    "ulkeler/singapur/index.html",
    "on-gorusme/index.html",
]


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str]] = []
        self.images = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.urls.append(("href", a["href"]))
        elif tag in {"img", "script", "source"} and a.get("src"):
            self.urls.append(("src", a["src"]))
            if tag == "img":
                self.images += 1
        elif tag == "link" and a.get("href") and (
            a.get("rel") in {"stylesheet", "icon", "shortcut icon"}
            or "stylesheet" in str(a.get("rel"))
        ):
            self.urls.append(("href", a["href"]))


def local_target(page: Path, value: str) -> Path | None:
    if value.startswith(("#", "//", "data:", "mailto:", "tel:", "javascript:")):
        return None
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return None
    path = unquote(url.path)
    if "\\x00" in path or "\\\\" in path:
        raise ValueError("Unsafe local path")
    relative = path.removeprefix("/")
    if path.startswith("/"):
        candidate = ROOT / relative
    else:
        candidate = page.parent / relative
    if path.endswith("/") or not Path(path).suffix:
        candidate /= "index.html"
    candidate = candidate.resolve()
    if not candidate.is_relative_to(ROOT.resolve()):
        raise ValueError("Path escapes dist/")
    return candidate


def main() -> int:
    errors: list[str] = []
    for name in REQUIRED:
        if not (ROOT / name).is_file():
            errors.append(f"Required: {name}")
    pages = sorted(ROOT.rglob("*.html"))
    for page in pages:
        parser = References()
        parser.feed(page.read_text(encoding="utf-8"))
        for attr, value in parser.urls:
            try:
                target = local_target(page, value)
            except ValueError as e:
                errors.append(f"{page.relative_to(ROOT)} {attr}={value}: {e}")
                continue
            if target is not None and not target.is_file():
                errors.append(
                    f"{page.relative_to(ROOT)} {attr}={value} -> missing {target.relative_to(ROOT)}"
                )
    if len(pages) < 48:
        errors.append(f"Expected at least 48 HTML pages, found {len(pages)}")
    print(f"Audited {len(pages)} HTML pages under dist/")
    if errors:
        print("\\n".join(f"FAIL: {e}" for e in errors[:60]))
        print(f"Total errors: {len(errors)}")
        return 1
    print("PASS: required files and local HTML links/assets exist")
    return 0


if __name__ == "__main__":
    sys.exit(main())
