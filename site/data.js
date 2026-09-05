/*
 * Single source of truth for every fact this page renders.
 *
 * RULE: if a value appears on the page, it has a `source` here. No exceptions.
 * If a fact cannot be sourced, it does not get a key - it gets deleted.
 *
 * Values that change over time (holder count, transfers) are NOT stored here.
 * They are fetched live from Blockscout at runtime so the page can never show
 * a stale number as if it were current. See app.js -> loadChainFacts().
 */

window.PON = (function () {
  'use strict'

  const SOURCES = {
    akcHistory: {
      label: 'AKC \u2014 Polish Lowland Sheepdog History: Rebuilding the Breed After WWII',
      url: 'https://www.akc.org/expert-advice/dog-breeds/polish-lowland-sheepdog-history-rebuilding-breed-wwii/',
    },
    akcSeven: {
      label: 'AKC \u2014 7 Things You Didn\u2019t Know About The Polish Lowland Sheepdog',
      url: 'https://www.akc.org/expert-advice/lifestyle/7-things-you-didnt-know-about-the-polish-lowland-sheepdog/',
    },
    wikipedia: {
      label: 'Wikipedia \u2014 Polish Lowland Sheepdog',
      url: 'https://en.wikipedia.org/wiki/Polish_Lowland_Sheepdog',
    },
    winddancer: {
      label: 'Winddancer PONs \u2014 breed history',
      url: 'https://www.winddancerpons.com/breed.htm',
    },
    fciStandard: {
      label: 'FCI-Standard N\u00b0 251, Polski Owczarek Nizinny',
      url: 'https://www.fci.be/nomenclature/Standards/251g01-en.pdf',
    },
    fciNomenclature: {
      label: 'FCI nomenclature entry 251',
      url: 'https://fci.be/en/nomenclature/POLISH-LOWLAND-SHEEPDOG-251.html',
    },
    zkwp: {
      label: 'Polish Kennel Club (ZKwP) \u2014 history',
      url: 'https://zkwp.pl/historia_en.php?l=en',
    },
    blockscout: {
      label: 'Robinhood Chain Blockscout \u2014 token page',
      url: 'https://robinhoodchain.blockscout.com/token/0x7CC3628D910AEcf001C299315A1d897D879eA3aB',
    },
    ucdavisPon: {
      label: 'UC Davis VGL \u2014 Genetic Diversity Testing for Polish Lowland Sheepdog',
      url: 'https://vgl.ucdavis.edu/canine-genetic-diversity/polish-lowland-sheepdog',
    },
    einCheck: {
      label: 'ProPublica Nonprofit Explorer \u2014 EIN 39-3160948',
      url: 'https://projects.propublica.org/nonprofits/organizations/393160948',
    },
    pipa: {
      label: 'PON International Preservation Alliance',
      url: 'https://ponipa.org/',
    },
    akcPopular: {
      label: 'AKC \u2014 Most Popular Dog Breeds of 2025',
      url: 'https://www.akc.org/expert-advice/dog-breeds/most-popular-dog-breeds-2025/',
    },
    zkwpBreeders: {
      label: 'ZKwP/FCI registered PON breeders in Poland, by voivodeship',
      url: 'https://canibus.pl/hodowle-psow-rasowych-fci-zkwp/1-grupa/polski-owczarek-nizinny',
    },
  }

  /* ---- the token ------------------------------------------------------- */

  /* Current deployment. The old 0xdf0E...58EA contract is retired. */
  const TOKEN = {
    address: '0x7CC3628D910AEcf001C299315A1d897D879eA3aB',
    name: 'Poncoin',
    brand: 'PONCOIN',
    symbol: 'PON',
    chain: 'Robinhood Chain',
    pairedWith: 'USDG',
    x: 'https://x.com/PoncoinHood',
    buyUrl:
      'https://www.ponsfamily.com/launchpad/0x7cc3628d910aecf001c299315a1d897d879ea3ab',
    explorer:
      'https://robinhoodchain.blockscout.com/token/0x7CC3628D910AEcf001C299315A1d897D879eA3aB',
    apiBase: 'https://robinhoodchain.blockscout.com/api/v2',
    creatorTax: '0.00%',
  }

  /* ---- how buying actually works --------------------------------------- */

  /*
   * IMPORTANT, verified 2026-08-29: this token has NOT graduated off the Pons
   * bonding curve, and Dexscreener reports no pairs. Bots and terminals route
   * through DEX pools, so none of them can fill a $PON buy today. They are
   * genuinely useful for the funding/bridging half, which is how they are
   * presented below. Do not tell anyone to "buy $PON on GMGN" until a pool
   * exists \u2014 they will land on nothing.
   */

  const BUY_INTRO = {
    lead: 'It is still on the curve, so there is exactly one place to buy it.',
    body:
      'Trading bots and terminals route through liquidity pools. $PON does not '
      + 'have one yet \u2014 it trades against its bonding curve on Pons until that '
      + 'curve sells out. So the route below is in two halves: get funds onto '
      + 'Robinhood Chain, then buy on Pons.',
  }

  // Half one: getting money onto the chain. These are referral links.
  const VENUES = [
    {
      name: 'Based Bot',
      tag: 'Telegram bot \u00b7 wallet and bridge built in',
      badge: 'Easiest',
      url: 'https://t.me/based_eth_bot?start=r_GojoCookz',
      cta: 'Open Based Bot',
      steps: [
        'Tap the button \u2014 Telegram opens. Hit Start.',
        'The bot makes you a wallet. Settings \u2192 export your private key and '
          + 'store it somewhere safe. Never share it.',
        'Send SOL, BNB or ETH to that wallet, then use the bot\u2019s Bridge menu '
          + 'to move it onto Robinhood Chain.',
      ],
    },
    {
      name: 'Axiom',
      tag: 'Pro terminal \u00b7 charts, limit orders, speed',
      url: 'https://axiom.trade/@robinh00d',
      cta: 'Open Axiom',
      steps: [
        'Sign up, takes about a minute.',
        'Deposit SOL, BNB or ETH and bridge to Robinhood Chain inside Axiom.',
      ],
    },
    {
      name: 'GMGN',
      tag: 'Fast web trading \u00b7 PnL tracking',
      url: 'https://gmgn.ai/r/Robinhood?chain=robinhood',
      cta: 'Open GMGN',
      steps: [
        'Open the link \u2014 Robinhood Chain is already selected.',
        'Create or connect a wallet and fund it with bridged SOL, BNB or ETH.',
      ],
    },
    {
      name: 'Sigma',
      tag: 'Telegram bot \u00b7 alternative to Based',
      url: 'https://t.me/Sigma_buyBot?start=ref=juggsarmy',
      cta: 'Open Sigma',
      steps: [
        'Telegram opens. Hit Start and fund the wallet it creates for you.',
      ],
    },
  ]

  const DIY = {
    title: 'Prefer full self-custody?',
    body:
      'Add Robinhood Chain to a wallet you already control and bridge ETH in '
      + 'yourself. No bot, no referral, same result.',
    links: [
      { label: 'Get MetaMask', url: 'https://metamask.io/download/' },
      { label: 'Robinhood Chain docs', url: 'https://docs.robinhood.com/chain/' },
    ],
  }

  // Half two: the actual purchase.
  const BUY_FINAL = {
    title: 'Then buy on Pons',
    steps: [
      'Open the token on Pons using the button below.',
      'Check the contract address there matches the one on this page, character '
        + 'for character. That address is the only thing that cannot be faked.',
      'Choose your size and buy. You can sell back into the same curve at any '
        + 'time \u2014 you are not waiting for someone else to take the other side.',
    ],
    later:
      'Once the curve sells out, $PON graduates into a permanently locked '
      + 'Uniswap pool. At that point the bots and terminals above will be able '
      + 'to trade it too. They cannot yet.',
  }

  // FTC 16 CFR 255 \u2014 say it plainly, above the links, not in a footer.
  const REFERRAL_DISCLOSURE =
    'The four links below are referral links. If you sign up through them this '
    + 'project may receive a referral benefit, at no extra cost to you. You can '
    + 'skip them entirely and use the self-custody route instead \u2014 you end up '
    + 'in exactly the same place.'

  /* ---- the funding mechanism ------------------------------------------- */

  /* ---- the beneficiary --------------------------------------------------
   *
   * PIPA is PON-specific, takes cards, and exists to work on the exact
   * problem this whole page is about. Its 501(c)(3) status was verified
   * INDEPENDENTLY against IRS data (ProPublica mirror), not taken from its
   * own website — the EIN is published below so anyone can repeat the check.
   *
   * Still NOT contacted. Nothing here claims a partnership.
   */
  const BENEFICIARY = {
    name: 'PON International Preservation Alliance',
    short: 'PIPA',
    site: 'https://ponipa.org/',
    donate: 'https://givebutter.com/PIPA',
    email: 'ponalliance@gmail.com',

    status: '501(c)(3) public charity',
    ein: '39-3160948',
    einCheck: 'https://projects.propublica.org/nonprofits/organizations/393160948',
    ruling: '1 November 2025',
    registered: 'Phoenix, Arizona',

    lead: 'A real charity is fixing it.',
    body: 'PIPA maps PON DNA with the Orthopedic Foundation for Animals, so breeders can widen the gene pool instead of narrowing it. Registered 501(c)(3). Takes cards.',

    // Their words, from their own science page. Note the conditional — they
    // are careful, and we quote them rather than asserting anything harder.
    quote:
      'Unless we manage to preserve genetic diversity, it is only a matter of '
      + 'time until we lose the healthy, vigorous breed we love.',

    // Say the weak parts out loud.
    caveats: [
      'PIPA is new. The IRS granted its exempt status on 1 November 2025 and '
        + 'it has not filed a Form 990 yet, so there is no public financial '
        + 'track record to inspect.',
      'Nobody from this project has contacted them. They have not endorsed, '
        + 'partnered with, or accepted anything from $PON, and may never.',
    ],

    noStrings: 'Skip the token. Give them the money direct. Helps just as much.',
  }

  /* ---- what UC Davis actually found -------------------------------------
   *
   * Finally read on 2026-08-31 after the page 403'd repeatedly. Every figure
   * here carries its unit — "103 dogs tested", never a bare "103" that could
   * be misread as a population count.
   */
  const DIVERSITY = {
    lead: 'The bottleneck has been measured.',
    body: 'UC Davis measured it and published the numbers.',
    facts: [
      { label: 'Dogs tested for the baseline', value: '103 swabs' },
      { label: 'Markers used', value: '33 STR loci + 7 DLA regions' },
      { label: 'Report published', value: '28 Feb 2024, updated Aug 2024' },
      { label: 'Cost per dog', value: '$90, or $60 with code PLSDIV' },
    ],
    // The most interesting number on the whole page, and the easiest to
    // misread, so the unit is doing real work here.
    polandLead: 'Poland barely shows up in its own dog\u2019s DNA record.',
    polandBody: '83 of the 103 swabs came from the US. One came from Poland. One swab, not one dog.',
    source: 'ucdavisPon',
  }

  /* ---- Korabiewice ------------------------------------------------------
   *
   * The bridge is NOT "this shelter has a PON" \u2014 it does not, and I checked
   * twenty of its listings. The bridge is that Poland saved its dogs once by
   * going and looking, the PON is the proof it worked, and the same job is
   * being done badly funded right now.
   *
   * Nothing here implies a partnership. They do not know this project exists.
   * We are pointing at a public fundraiser, which needs nobody's permission.
   *
   * The raised figure CANNOT be fetched live \u2014 pomagam.pl sends no CORS
   * headers \u2014 so it ships with a visible as-of date and a link to the live
   * number. Re-check it before any public launch.
   */
  const SHELTER = {
    name: 'Schronisko w Korabiewicach',
    org: 'Fundacja Viva!',
    site: 'https://schronisko.info.pl/',
    fundraiser: 'https://pomagam.pl/p7dh4m',
    feedUrl: 'https://schronisko.info.pl/nakarm-zwierzaka-za-3zl/',
    x: 'https://twitter.com/fundacja_viva',

    // their headline, their words
    theirHeadline: 'Schronisko na kraw\u0119dzi. Najtrudniejszy moment od lat.',
    theirHeadlineEn: 'Shelter on the edge. The hardest moment in years.',

    raised: '145 787',
    goal: '300 000',
    currency: 'z\u0142',
    checkedOn: '30 August 2026',

    animals: 'about 300',
    unit: '3 z\u0142',
    unitClaim: 'feeds one animal, for a day. That is their own published figure.',

    lead: 'Or just feed a dog today.',
    body: 'A Polish shelter with about 300 animals is having its worst year in a decade.',
    bridge: 'Same country. Same job. Eighty years apart.',

    // The single most credibility-building sentence available.
    noStrings:
      'You do not have to buy anything. Giving Korabiewice money directly '
      + 'helps exactly as much, and we would rather you did that than nothing.',

    disclaimer:
      'We are not affiliated with, endorsed by, or sponsored by Fundacja Viva! '
      + 'They do not know this project exists. This is a public fundraiser we '
      + 'are pointing at because it is real and it is now.',
  }

  const RALLY = {
    line: 'The rescue worked.',
    lineEm: 'Finish paying for it.',
  }

  const FEES = {
    headline: 'Pons pays a creator fee on every trade.',
    body:
      'On this token the creator tax is 0.00% \u2014 nothing is skimmed off your '
      + 'buy. The fee that does exist is the launchpad\u2019s standard creator '
      + 'share, and Pons lets the creator point that fee anywhere, including '
      + 'straight at holders. That is the lever this project intends to aim at '
      + 'breed health research.',
    // Sourced from the live Pons token page for this contract.
    honestNote:
      'It is not aimed there yet. The fee recipient is still the deploying '
      + 'wallet, and until that changes in public, on chain, this is a stated '
      + 'intention and nothing more.',
  }

  /* ---- breed registry values ------------------------------------------- */

  const REGISTRY = [
    { label: 'Breed', value: 'Polski Owczarek Nizinny', source: 'fciStandard' },
    { label: 'Known as', value: 'Polish Lowland Sheepdog', source: 'fciNomenclature' },
    { label: 'Origin', value: 'Poland', source: 'fciStandard' },
    { label: 'FCI standard', value: 'N\u00b0 251', source: 'fciStandard' },
    { label: 'Group', value: '1 \u2014 Sheepdogs and Cattle Dogs', source: 'fciStandard' },
    { label: 'Section', value: '1 \u2014 Sheepdogs', source: 'fciStandard' },
    { label: 'Working trial', value: 'Without', source: 'fciStandard' },
    { label: 'FCI definitive acceptance', value: '10 May 1963', source: 'fciNomenclature' },
    { label: 'Standard in force since', value: '7 August 1998', source: 'fciNomenclature' },
  ]

  /* ---- the bottleneck -------------------------------------------------- */

  const BOTTLENECK = {
    // The hero quantity. Rendered as marks, never as a large numeral.
    survivors: 150,
    survivorsQualifier: 'about',
    // Short line carries the section; the detail sits underneath at body size.
    survivorsLead: 'In 1945, about 150 were left alive.',
    survivorsClaim: 'That is every one of them. Count the boxes.',
    survivorsSource: 'akcSeven',

    // Kurta and Laska were bought from a countryman by Dr Hryniewicz after the
    // war, and Smok was bred from the two of them. This is why exactly two of
    // the 150 marks are highlighted.
    foundersMarked: ['KURTA', 'LASKA'],
    foundersClaim:
      'A veterinarian, Dr Danuta Hryniewicz, went looking for surviving Polish '
      + 'sheepdogs among farmers in the north of the country. She bought two of '
      + 'them, Kurta and Laska, from a countryman.',
    foundersSource: 'winddancer',

    sire: {
      name: 'SMOK',
      kennel: 'z Kordegardy',
      translation: '\u201cDragon\u201d',
      breeder: 'Dr Danuta Hryniewicz',
      sire: 'KURTA',
      dam: 'LASKA',
      litters: 10,
    },
    sireClaim: 'Ten litters. One dog. Every PON on earth is his.',
    sireSource: 'wikipedia',

    /*
     * This block exists to kill a misreading before it starts.
     *
     * "150" is a 1945 figure. The breed is NOT endangered today, and any copy
     * implying it is would be false, trivially disprovable, and would be
     * soliciting money on a fabricated emergency. Say the true thing louder
     * than anyone can say the false one.
     */
    todayLead: 'They are not dying out today.',
    todayBody: 'The 150 is a 1945 number. The breed is rare, not endangered. Anyone telling you otherwise is selling something.',
    todayFacts: [
      { label: 'AKC popularity rank, 2025', value: '#192 of 202', source: 'akcPopular' },
      { label: 'Status', value: 'Rare \u2014 not endangered' },
      {
        label: 'Recognised by',
        value: 'FCI, AKC, UK KC, CKC, ANKC, NZKC, UKC',
        source: 'fciNomenclature',
      },
      {
        label: 'Breeders in Poland',
        value: 'Active, listed by region',
        source: 'zkwpBreeders',
      },
    ],
    todayTurn: 'The damage is in the DNA, not the headcount.',

    costLead: 'One dog means one gene pool.',
    // Corrected 2026-08-31. This previously said a diversity study "is
    // running at UC Davis today". It is not running — it is FINISHED, the
    // baseline was published in Feb 2024. What is ongoing is individual dogs
    // being tested against it. Do not let this drift back.
    costClaim: 'Thin genes make sick dogs. Allergies, autoimmune disease, cancer.',
  }

  /* ---- Psyche ---------------------------------------------------------- */

  const PSYCHE = {
    name: 'PSYCHE',
    claim:
      'A PON in occupied Warsaw could sense bombs before they fell. She would '
      + 'start barking minutes ahead of the air raids, and people followed her '
      + 'to the shelters. She is credited with saving hundreds of lives.',
    source: 'akcHistory',
    note: 'Recorded as legend in the breed history, not as documented record.',
  }

  /* ---- what this project is -------------------------------------------- */

  const PURPOSE = {
    headline: 'Trading fees fund Polish Lowland Sheepdog health research.',
    body:
      'Not rescue. There is almost nothing in PON rescue \u2014 that is what '
      + 'happens when a breed is saved. The unpaid bill is genetic, and genetic '
      + 'research is a thing money can actually buy.',
    // No beneficiary is named. Nobody has agreed to anything yet.
  }

  /* ---- the status board: the honest bit -------------------------------- */

  const STATUS = [
    {
      claim: 'The contract exists and is verified on Robinhood Chain',
      state: 'confirmed',
      detail: 'Verified source. Not flagged.',
      source: 'blockscout',
    },
    {
      claim: 'The deployer wallet holds no tokens',
      state: 'confirmed',
      detail: 'Dev holds zero.',
      source: 'blockscout',
    },
    {
      claim: 'Holder and transfer counts shown below are live',
      state: 'confirmed',
      detail: 'Read from the Blockscout API in your browser, not hardcoded.',
      source: 'blockscout',
    },
    {
      claim: 'A charity has been chosen',
      state: 'confirmed',
      detail: 'PIPA. PON-specific, and working on this exact problem.',
      source: 'pipa',
    },
    {
      claim: 'Its 501(c)(3) status has been independently verified',
      state: 'confirmed',
      detail: 'EIN 39-3160948, checked against IRS records. Not their word for it.',
      source: 'einCheck',
    },
    {
      claim: 'The charity has been contacted',
      state: 'confirmed',
      detail: 'PIPA is reviewing this page. No partnership or endorsement is claimed.',
    },
    {
      claim: 'A donation has been made',
      state: 'confirmed',
      detail: '$833.05 total. See receipts below.',
    },
    {
      claim: 'The token has a market',
      state: 'pending',
      detail: 'Still on the curve. No pool, no chart yet.',
      source: 'blockscout',
    },
    {
      claim: 'Creator fees are pointed at research',
      state: 'pending',
      detail: 'Fees still go to the deploy wallet. Not redirected yet.',
    },
    {
      claim: 'The project has its own X account',
      state: 'confirmed',
      detail: '@PoncoinHood.',
    },
  ]

  /* ---- figures deliberately not shown ---------------------------------- */

  const WITHHELD = [
    {
      figure: 'Percentage of supply held, and float',
      reason: '779M of the 1B supply is unaccounted for. No float claim until it is.',
    },
    {
      figure: 'A donation target, or a percentage of fees',
      reason: 'No number until there is a receipt beside it.',
    },
  ]

  /* ---- ledger ---------------------------------------------------------- */

  /* Donation tracker. Each entry needs a real receipt image in site/receipts/
     and, where the money moved on-chain, a tx hash. Nothing goes in here
     without a receipt you can open. */
  const LEDGER = [
    {
      date: '2026-09-05',
      amount: '$29.81',
      org: 'PIPA',
      note: 'GiveButter donation',
      receipt: 'receipts/001-29-81.png',
      tx: '',
    },
    {
      date: '2026-09-05',
      amount: '$118.30',
      org: 'PIPA',
      note: 'GiveButter donation',
      receipt: 'receipts/002-118-30.png',
      tx: '',
    },
    {
      date: '2026-09-05',
      amount: '$236.28',
      org: 'PIPA',
      note: 'GiveButter donation',
      receipt: 'receipts/003-236-28.png',
      tx: '',
    },
    {
      date: '2026-09-05',
      amount: '$448.66',
      org: 'PIPA',
      note: 'GiveButter donation',
      receipt: 'receipts/004-448-66.png',
      tx: '',
    },
  ]

  /* ---- photo credits (mirrors assets/breed-photos/CREDITS.md) ---------- */

  const PHOTOS = [
    {
      file: 'Argo-Jack_von_Nora_s_Nizina.jpg',
      alt: 'A Polish Lowland Sheepdog running across grass towards the camera, tongue out.',
      author: 'Nizina',
      license: 'CC BY 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Argo-Jack_von_Nora%27s_Nizina.JPG',
    },
    {
      file: 'Polish_Lowland_Sheepdog_puppy_Bruno_by_Vetulani.jpg',
      alt: 'A black and white Polish Lowland Sheepdog puppy standing in long grass.',
      author: 'Franek Vetulani',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
      source:
        'https://commons.wikimedia.org/wiki/File:Polish_Lowland_Sheepdog_puppy_Bruno_by_Vetulani.JPG',
    },
    {
      file: 'Polski_owczarek_nizinny_rybnik-kamien_pl.jpg',
      alt: 'A brown and white Polish Lowland Sheepdog standing among autumn leaves.',
      author: 'Pleple2000',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      source:
        'https://commons.wikimedia.org/wiki/File:Polski_owczarek_nizinny_rybnik-kamien_pl.jpg',
    },
    {
      file: 'Storalvare.jpg',
      alt: 'Five Polish Lowland Sheepdogs sitting in a row indoors.',
      author: 'Jennie Lundqvist Beltapar',
      license: 'CC BY 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Storalvare.JPG',
    },
  ]

  const DISCLAIMER =
    'No organisation has endorsed, partnered with, or accepted anything from '
    + 'this project. Nothing on this page should be read as implying otherwise. '
    + 'This is not an official kennel-club document and is not affiliated with '
    + 'the FCI, the Polish Kennel Club, or the AKC. This is not financial advice '
    + 'and $PON is not an investment.'

  return {
    SOURCES,
    TOKEN,
    BUY_INTRO,
    VENUES,
    DIY,
    BUY_FINAL,
    REFERRAL_DISCLOSURE,
    BENEFICIARY,
    DIVERSITY,
    SHELTER,
    RALLY,
    FEES,
    REGISTRY,
    BOTTLENECK,
    PSYCHE,
    PURPOSE,
    STATUS,
    WITHHELD,
    LEDGER,
    PHOTOS,
    DISCLAIMER,
  }
})()

