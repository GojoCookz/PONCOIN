# $PON — research baseline

Everything verified as of 2026-08-29. Nothing in this file is an estimate.
If a claim is not sourced here, it does not go on the site.

---

## 1. The token, on-chain

Read directly from the Robinhood Chain Blockscout API.

| Field | Value |
|---|---|
| Contract | `0xdf0E757812d792d24cE39EEc04bD19519A1458EA` |
| Name | Polski Owczarek Nizinny |
| Symbol | PON |
| Decimals | 18 |
| Total supply | 1,000,000,000 |
| Holders | 16 |
| Transfers | 230 |
| Deployer | `0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42` (`PonsV2LaunchDeployer`) |
| Contract label | `PonsV2LauncherToken` |
| Verified | yes |
| Reputation | `ok`, not flagged as scam |
| Icon URL | **not set** |
| DEX pair | none indexed — still on the bonding curve, has not graduated |

Top holder holds 40,680,948 PON = **4.07%** of supply. All top holders are
EOAs, not contracts. The deployer address does not appear in the holder list.

### Holder count is falling

Read again a few hours later on the same day:

| Time | Holders | Transfers |
|---|---|---|
| first read | 16 | 230 |
| second read | **7** | 244 |

**Holders more than halved while transfers went up.** On a pre-graduation
bonding curve that means people are selling back into the curve. This is
exactly why the site fetches these counts live instead of hardcoding them —
a number written into the page that morning would have been wrong by evening.

It also sharpens the redeploy question: there are fewer people left to
inconvenience than there were.

Distribution across the 16 holders totals roughly 221M of the 1B supply.
**Open question:** the remaining ~779M is not attributed to any listed holder.
Resolve this before publishing any supply or float claim.

### Ticker collision (unresolved)

- `PON COIN (PON)` already exists on Robinhood Chain at
  `0x76fdD7C8DfB45294A1d13de698F01DAF52F39be3`, 1B supply.
- `PON COIN (PON)` also exists on BNB Chain at
  `0xe2bdcb9ec67b343b9820DfBBfDd13e8126540270`.
- **PONS** is the Robinhood Chain launchpad token, ~$157M market cap and
  ~$33M 24h volume. `PON` is one character off from the launchpad token of
  the chain it is deployed on.

Robinhood Chain has a documented impostor-ticker problem. This is a decision
to make deliberately, not something to discover after launch.

---

## 2. Beneficiary — decided

**Structure: APLSA (primary) + PON in Not (small fixed slice).**

### Primary — APLSA

American Polish Lowland Sheepdog Association, Inc. — <https://aplsa.org>

- Incorporated **2012** as a **501(c)(3)** not-for-profit (per their own site;
  **still to be independently verified**, see Open Items).
- Has named officers, a treasurer, a bookkeeper, and legal counsel.
- Stated goal #8, verbatim: *"To provide for the raising of funds through
  private and public donations."*
- Currently funds two research programs:
  1. **Canine genetic diversity study at UC Davis**, specific to the Polish
     Lowland Sheepdog.
     <https://vgl.ucdavis.edu/canine-genetic-diversity/polish-lowland-sheepdog>
  2. **Cancer research by Dr. Amy Koterbay**, head of oncology at University
     College Dublin. <https://www.koterbayponproject.com/>
     Open to all PON owners, no club membership required.

**Why this and not rescue:** research absorbs money. PON rescue cannot.

### Secondary — PON in Not

<https://www.pon-nothilfe.de/> — German/Swiss PON rehoming network.

- Operating since 2000, covers Germany and Switzerland.
- Explicitly **unpaid and volunteer** ("UNENTGELTLICH und EHRENAMTLICH").
- No shelter building; places dogs through foster homes (*Pflegestellen*).
  Takes the standard *Schutzgebühr* on successful placement.
- Has a donation page (Spenden).
- Placement volume is low: latest post January 2025, three in November 2024,
  one in August 2023.

Right-sized at a small fixed amount. Sending a large sum to a volunteer group
that places a handful of dogs a year creates an accounting problem, not impact.

### Rejected beneficiaries, with reasons

| Org | Why rejected |
|---|---|
| APONC (aponc.org) | Breed club, not a charity. Their site states they currently have **zero PONs in rescue**. Deductibility unclear. |
| RescueMe.org | **Not a shelter.** A classifieds directory. Its own counter shows **45 PONs adopted total since 1999**; footer reads 1999-2018. Its Donate button funds the listings site. |

---

## 3. Why the story closes

Sourced from AKC, Wikipedia, and the Border Collie Museum breed history.

- Germany invaded Poland in 1939, destroying the in-progress breed registry.
  All dog activity in Poland halted.
- **Only about 150 PONs remained after WWII.**
- The breed was rebuilt by vet **Dr. Danuta Hryniewicz** around her dog
  **Smok** ("Dragon"), who sired the first ten litters in the 1950s.
  Every PON alive today descends from him. The Kordegarda stock was heavily
  inbred on Smok; the official standard was written from him and accepted by
  the FCI in **1959**.
- A PON named **Psyche** in occupied Warsaw reportedly barked minutes before
  air raids, sending people to shelters before the bombs landed.
- AKC recognition: Miscellaneous class 1999, Herding Group **2001**.

The narrative closes on itself: the breed survived by inbreeding hard on one
sire, which is precisely why a **genetic diversity study** on this breed is
running at UC Davis today. The rescue kennels are empty because the rescue
worked. The bill that came due is genetic, not shelter space.

That is what APLSA funds.

---

## 4. Distribution channels — findings

**APONC Facebook group** (`facebook.com/groups/356187901851224`) —
read directly in-browser while logged in.

- Official group of American Polish Lowland Sheepdog Club, Inc.
- **118 members**, created 27 November 2018.
- Activity: **1 post in the last month**, none that day, **0 new members in
  the last week**.
- Private group, membership gated.

Posted rules, verbatim:

> Rule 2 — No Promotions or Spam. "Self-promotion, spam and irrelevant links
> aren't allowed."
> Rule 3 — "Any member who posts negative or derogatory comments will be
> removed from this group. The Board has adopted a zero tolerance policy."
> Rule 4 — No litter listings or announcements.
> Rule 5 — Only APONC members can join this group.

**Conclusion: this is not a distribution channel.** 118 dues-gated people,
one post a month, explicit no-promotion rule, zero-tolerance removal.
Posting the token there burns the breed community permanently for zero reach.
Join to read. Do not post.

---

## 5. Breed photos

20 images downloaded from Wikimedia Commons via
`research/fetch-breed-photos.ps1`. Every file's license and required
attribution is recorded in `assets/breed-photos/CREDITS.md`.
Contact sheet for review: `research/contact-sheet.jpg`.

All 20 carry a free license (CC BY 3.0, CC BY-SA 3.0, or CC BY-SA 4.0).
Zero were rejected on license grounds.

### Shortlist for the site

| # | File | Use | Res | License |
|---|---|---|---|---|
| 2 | `Argo-Jack_von_Nora_s_Nizina.JPG` | hero — running at camera, high joy | 3008x2000 | CC BY 3.0 |
| 6 | `Polish_Lowland_Sheepdog_puppy_Bruno_by_Vetulani.JPG` | puppy, lineage beat | 4000x3000 | CC BY-SA 3.0 |
| 14 | `PON_BrunobyVetulani.jpg` | wide banner crop | 4113x2712 | CC BY-SA 4.0 |
| 13 | `Polski_owczarek_nizinny_rybnik-kamien_pl.jpg` | autumn standing profile | 2468x2172 | CC BY-SA 4.0 |
| 5 | `Oowczarek_polski_nizinny_pl.jpg` | portrait crop, mobile hero | 1924x2220 | CC BY-SA 3.0 |
| 15 | `Storalvare.JPG` | five dogs in a row — the Smok line | 3264x2448 | CC BY 3.0 |

### Do not use

- `Polski_owczarek_nizinny.jpg` — **author is UNKNOWN** in the Commons
  metadata. Attribution is legally required and cannot be given. Excluded.
- `Krajowa_Wystawa_Psow_Rasowych_Rybnik_2006_polskie_rasy.jpg`,
  `Wystawa_w_Czestochowie_09.10.10_2p.jpg`,
  `Wystawa_w_Czestochowie_ocena_finalowa_zwyciezcow_grup_09.10.10_p.jpg` —
  dog-show photos containing **identifiable faces**. Those people did not
  consent to appearing on a token site; using them implies endorsement.
- `Amy_von_Bohlmann_s_Land.jpg` — 394x312, too small for any real use.

### LICENSE TRAP — read before making the logo

Most of these images are **CC BY-SA**, which is a copyleft ShareAlike license.
Displaying them on a page with credit is fine. **Deriving the token logo or
any brand mark from a CC BY-SA photo would force that logo to be released
under CC BY-SA as well** — meaning anyone could legally reuse the project's
own logo, including a competing or impostor token. On a chain with a known
impostor problem, that is a serious own-goal.

The token logo must be **original artwork**, not a derivative of any photo in
this folder. Photos are for editorial use on the page, with visible credit.

---

## 6. Open items — blocking

1. **Verify APLSA's 501(c)(3)** in the IRS Tax Exempt Organization Search.
   Their own website claiming it is not evidence. This is the first fact a
   hostile reader will check.
2. **Contact APLSA privately** (treasurer) before anything public. Confirm
   they will accept the donation and by what route.
3. **Do not put APLSA's name or logo on the site until they agree in
   writing.** Implying a partnership that does not exist would kill the
   project and deserves to.
4. **Read the UC Davis genetic diversity report.** The page blocked automated
   access on 2026-08-29 (403, then killed the browser tab). **No genetic
   diversity figure goes on the site until a human has read that report.**
5. **Resolve the ~779M unattributed supply** before any tokenomics claim.
6. **Decide the PON vs PONS ticker question**, and whether to redeploy while
   still pre-graduation on the curve (cheapest exit window for the current
   16 holders).
7. Confirm PON in Not's legal form (e.V.?) and donation route from the
   Impressum.

---

## 7. Sources

- AKC breed history — <https://www.akc.org/expert-advice/dog-breeds/polish-lowland-sheepdog-history-rebuilding-breed-wwii/>
- AKC 7 things — <https://www.akc.org/expert-advice/lifestyle/7-things-you-didnt-know-about-the-polish-lowland-sheepdog/>
- Wikipedia — <https://en.wikipedia.org/wiki/Polish_Lowland_Sheepdog>
- Border Collie Museum, Poland — <http://www.bordercolliemuseum.org/BCCousins/EuropeEastern/Poland.html>
- Winddancer breed history — <https://www.winddancerpons.com/breed.htm>
- APLSA — <https://aplsa.org/>
- APONC — <http://www.aponc.org/>
- PON in Not — <https://www.pon-nothilfe.de/>
- RescueMe PON — <https://polishlowlandsheepdog.rescueme.org/>
- Blockscout API — <https://robinhoodchain.blockscout.com/api/v2/tokens/0xdf0e757812d792d24ce39eec04bd19519a1458ea>
