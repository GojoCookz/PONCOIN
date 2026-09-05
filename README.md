# $PON — Polski Owczarek Nizinny

Site for $PON, a token on Robinhood Chain built around the Polish Lowland
Sheepdog and the genetic bottleneck the breed still carries.

**Contract:** `0xdf0E757812d792d24cE39EEc04bD19519A1458EA` (Robinhood Chain)

## What this is

In 1945 roughly 150 Polish Lowland Sheepdogs were left alive. The breed was
rebuilt around a single sire, Smok, and every PON alive today descends from
him. That rescue worked — and it left a permanently narrow gene pool, which
UC Davis has since measured and published.

The site tells that story, and points at
[PIPA](https://ponipa.org/) (PON International Preservation Alliance,
501(c)(3), EIN 39-3160948), the charity working on exactly that problem.

**The breed is not endangered today.** It is rare — AKC rank #192 of 202 in
2025 — with an active studbook and breeders taking deposits. The 150 figure is
historical. The site says so explicitly, in large type, because the alternative
is a claim that falls apart the first time anyone checks it.

## Running it

Plain static HTML/CSS/JS. No build step, no dependencies.

```bash
cd site
node server.mjs 4173      # http://localhost:4173
```

`vercel.json` is included for deployment.

## Layout

```
site/
  index.html        markup
  styles.css        Robinhood black + #00C805
  data.js           every fact rendered on the page, each with a source
  app.js            renderer
  game.js           "Spot the PON" — tap the PON among lookalike breeds
  game-data.js      generated photo pool with per-image attribution
  img/              web-sized breed photos
  server.mjs        zero-dependency static server
assets/
  breed-photos/     licensed originals + CREDITS.md
research/
  RESEARCH.md       sourced findings behind every claim on the site
  *.ps1             re-runnable photo sourcing and processing scripts
```

## Rules this project follows

- **Every number on the page carries its unit.** Not "103" but "103 swabs".
  Two figures have already been misread as population counts; the unit is
  what stops it.
- **No claim ships without a source.** `data.js` holds a `SOURCES` map and
  every rendered fact references one.
- **The status board publishes what is *not* true yet** — what has not been
  confirmed, contacted, or paid. It is the point of the page, not a footnote.
- **No partnership is implied.** PIPA has not been contacted and has not
  endorsed anything. The site says that on the page.

## Photo credits

All breed photographs come from Wikimedia Commons under Creative Commons
licences. Attribution for every image is recorded in
`assets/breed-photos/CREDITS.md` and rendered next to the photos on the site.

The logo must be **original artwork** — most of these photos are CC BY-SA, and
deriving a brand mark from one would place that mark under CC BY-SA too.
