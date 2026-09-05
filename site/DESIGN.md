# $PON site — design plan

Written before any code, per the house pipeline. Step 2 (plan) and step 3
(plan audit) live here so the reasoning is checkable later.

Mode: **brand**, not product. This is a landing page, not an app shell.

---

## Concept

The page borrows the **grammar of a kennel-club pedigree document**, not its
identity. Field labels in block capitals over hairline rules, values below.
Registration-style numbers set in mono. Sections numbered as register entries.

Real conventions this is built on, all verified (see `research/RESEARCH.md`):

- A ZKwP *rodowód* is A4 on heavy stock: page one is a four-generation table
  on white, page two is data on a yellow ground split by the Polish flag.
- Pedigree forms instruct **"PROSZĘ WYPEŁNIAĆ DRUKOWANYMI LITERAMI"** —
  fill in block capitals. That is where the label treatment comes from.
- Registration numbers print in full with their book prefix: `PKR.IV-1234`.
- **Champions print in red** on Kennel Club pedigrees. That is where the
  single accent colour comes from, and what it means: a confirmed entry.
- FCI-Standard N° 251, Group 1 Section 1, origin Poland — real values for
  this breed, rendered as a real record.

### Hard line: do not impersonate a registry

The page uses the *form language* of a pedigree. It must never carry ZKwP,
FCI, or AKC marks, holograms, or wording that implies an official registry
issued it. The header names it as this project's own record. Same rule as the
beneficiary: borrow the reasoning, never imply the endorsement.

---

## Signature element

One idea, executed once: **the bottleneck diagram.**

```
  ┌ 150 hairline marks ─────────────────────┐
  │ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ │   what was left in 1945
  │ ▫ ▫ ▪ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▪ ▫ ▫ ▫ ▫ ▫ ▫ │   two marked red: KURTA, LASKA
  └───────────────┬─────────────────────────┘
                  ▼
                SMOK                             one sire, ten litters
                  │
        ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁                     every PON alive today
```

The hero is not a big number in a box. It is 150 marks you can actually
count-by-eye, so "that is not many" lands before the caption does. Kurta and
Laska are marked because Smok was bred from them — both were among the dogs
found on farms after the war. That is accurate, not decorative.

Everything else on the page stays quiet.

---

## Tokens

Cold document stock, deliberately **not** the warm-cream-and-serif look.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FBFAF8` | page ground, cold off-white |
| `--paper-2` | `#F2EFE6` | inset panels, table stripes |
| `--stock` | `#EAD9A0` | the registry-yellow data band, used once |
| `--ink` | `#15171B` | text |
| `--ink-2` | `#5A5E66` | secondary text, labels |
| `--rule` | `#C8C4B8` | hairlines, 1px |
| `--champion` | `#C8102E` | confirmed entries + the flag divider only |

`--champion` is Polish-flag red and is the page's only chromatic accent.
It is spent on exactly two things: confirmed status rows, and the flag rule.

## Type

One superfamily, three cuts — institutional without being Inter.

- **IBM Plex Sans Condensed**, 600, uppercase, tracked +0.12em — field labels
  and section eyebrows. This is the "block capitals" instruction made visual.
- **IBM Plex Sans** — body and headings.
- **IBM Plex Mono** — every number, registration code, address, and date.
  Tabular figures throughout.

Scale uses `clamp()`; base 17px on mobile.

## Layout

Mobile-first at 390px, single column, form-field rhythm: label, rule, value.
Desktop widens to a two-column register where the diagram spans full width.
Max content width 68ch for prose, wider for tables.

## Motion floor

Transitions only, `transform`/`opacity` only. The 150 marks fade in on scroll
in a staggered sweep, ~600ms total. `prefers-reduced-motion` renders them
immediately with no transition.

---

## Step 3 — plan audit

*Would I produce this plan for any similar brief?* Checking against the
workspace's spent defaults:

| Default | Avoided? |
|---|---|
| Warm cream + serif display + terracotta | Yes — cold paper, no display serif, red not terracotta |
| Near-black + acid accent | Yes — light ground |
| Broadsheet, hairline rules, dense columns | Partially shared (hairlines) but the grid logic is a **form**, not a newspaper: labelled fields, not columns of body text |
| Stock shadcn: gray cards, `rounded-lg`, Inter, centered flex | Yes — 0 radius, Plex, left-aligned field rhythm |
| Purple gradient on white | Yes |
| `01 / 02 / 03` markers on non-sequences | **Used, but earned** — these are register entries in a document that is literally numbered. Kept. |
| Big stat + small label as hero | **Caught.** Rewritten: the hero is 150 countable marks, not the numeral 150 in large type. The quantity is shown, not asserted. |

What changed from the first pass: the hero. It was going to be the numeral
`150` set huge. That is default #7 exactly. Showing 150 marks instead makes
the reader do the arithmetic, which is the whole point of the fact.

Accessory removed: a planned wax-seal / stamp graphic in the footer. It was
decoration pretending to be authority on a page whose entire argument is that
it has not been authorised by anyone yet.

---

## Content rules for this build

Enforced in `data.js`; every rendered fact carries a `source`.

**Ships:** the breed history, the FCI registry values, the on-chain token
facts (fetched live from Blockscout, with a visible failure state), the
status board, an empty ledger.

**Does not ship:** APLSA's name or logo, any dollar promise, any supply or
float percentage, any genetic-diversity figure, holder count as social proof.

The status board publishes what is *not* confirmed. That is the point of it.
