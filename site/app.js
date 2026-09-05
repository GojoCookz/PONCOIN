/*
 * $PON — page renderer.
 *
 * Everything rendered here comes from window.PON (data.js) or from a live
 * Blockscout read. Nothing factual is hardcoded in the markup.
 */

;(function () {
  'use strict'

  const D = window.PON
  const $ = (id) => document.getElementById(id)

  /* ---- helpers --------------------------------------------------------- */

  function el(tag, cls, text) {
    const n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }

  function link(url, label) {
    return (
      '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'
    )
  }

  function sourceLine(key) {
    const s = D.SOURCES[key]
    return s ? 'Source: ' + link(s.url, s.label) : ''
  }

  function fmt(n) {
    return typeof n === 'number' ? n.toLocaleString('en-US') : n
  }

  /* ---- buy links (one source of truth) --------------------------------- */

  function renderBuyLinks() {
    ;['bar-buy', 'hero-buy', 'main-buy'].forEach(function (id) {
      const a = $(id)
      if (a) a.href = D.TOKEN.buyUrl
    })
    const ex = $('ca-link')
    if (ex) ex.href = D.TOKEN.explorer
  }

  /* ---- sticky bar ------------------------------------------------------ */

  function initBar() {
    const bar = $('bar')
    const hero = document.querySelector('.hero')
    if (!bar || !hero) return

    if (!('IntersectionObserver' in window)) {
      bar.classList.add('is-shown')
      return
    }

    // Show the bar once the hero (and its own CTA) has scrolled away.
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          bar.classList.toggle('is-shown', !e.isIntersecting)
        })
      },
      { rootMargin: '-70% 0px 0px 0px' },
    )
    io.observe(hero)
  }

  /* ---- registry -------------------------------------------------------- */

  function renderRegistry() {
    const host = $('registry')
    D.REGISTRY.forEach(function (row) {
      const wrap = el('div', 'registry__row')
      wrap.appendChild(el('dt', null, row.label))
      wrap.appendChild(el('dd', null, row.value))
      host.appendChild(wrap)
    })
  }

  /* ---- the 150 marks --------------------------------------------------- */

  function renderMarks() {
    const b = D.BOTTLENECK
    const host = $('marks')
    const frag = document.createDocumentFragment()
    const founderAt = [37, 92]

    for (let i = 0; i < b.survivors; i++) {
      const m = el('span', 'mark')
      if (founderAt.indexOf(i) !== -1) m.classList.add('mark--founder')
      frag.appendChild(m)
    }
    host.appendChild(frag)

    $('survivors-lead').textContent = b.survivorsLead
    $('survivors-claim').textContent = b.survivorsClaim
    $('survivors-source').innerHTML = sourceLine(b.survivorsSource)

    revealMarks(host)
  }

  function revealMarks(host) {
    const marks = host.querySelectorAll('.mark')
    const reduced =
      window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Marks render visible by default. Only opt into the hidden start state
    // if we can actually observe and reveal them again.
    if (reduced || !('IntersectionObserver' in window)) return

    host.classList.add('is-animated')

    let done = false
    const reveal = function () {
      if (done) return
      done = true
      marks.forEach(function (m, i) {
        setTimeout(function () {
          m.classList.add('is-in')
        }, (i / marks.length) * 700)
      })
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return
          reveal()
          io.disconnect()
        })
      },
      { threshold: 0.15 },
    )
    io.observe(host)
    setTimeout(reveal, 2000) // failsafe
  }

  /* ---- sire ------------------------------------------------------------ */

  function renderSire() {
    const b = D.BOTTLENECK
    const s = b.sire
    const host = $('sire-card')

    host.appendChild(el('p', 'sire-card__name', s.name))
    host.appendChild(el('p', 'sire-card__kennel', s.kennel + ' — ' + s.translation))

    const grid = el('dl', 'sire-card__grid')
    ;[
      ['Sire', s.sire],
      ['Dam', s.dam],
      ['Bred by', s.breeder],
      ['Litters sired', String(s.litters)],
    ].forEach(function (r) {
      const cell = el('div')
      cell.appendChild(el('dt', 'field-label', r[0]))
      cell.appendChild(el('dd', null, r[1]))
      grid.appendChild(cell)
    })
    host.appendChild(grid)

    $('sire-claim').textContent = b.sireClaim
    $('sire-source').innerHTML = sourceLine(b.sireSource)

    // "where they stand now" — the anti-misreading block
    $('today-lead').textContent = b.todayLead
    $('today-body').textContent = b.todayBody
    $('today-turn').textContent = b.todayTurn

    const facts = $('today-facts')
    b.todayFacts.forEach(function (f) {
      const row = el('div', 'facts__row')
      row.appendChild(el('dt', null, f.label))
      const dd = el('dd')
      dd.appendChild(document.createTextNode(f.value))
      if (f.source) {
        const s = D.SOURCES[f.source]
        const a = el('a', 'facts__src', 'verify')
        a.href = s.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        dd.appendChild(document.createTextNode(' '))
        dd.appendChild(a)
      }
      row.appendChild(dd)
      facts.appendChild(row)
    })

    $('cost-lead').textContent = b.costLead
    $('cost-claim').textContent = b.costClaim

    // what UC Davis actually measured — every figure carries its unit
    const dv = D.DIVERSITY
    if (dv) {
      $('dv-body').textContent = dv.body
      $('dv-poland-lead').textContent = dv.polandLead
      $('dv-poland-body').textContent = dv.polandBody
      $('dv-source').innerHTML = sourceLine(dv.source)

      const host = $('dv-facts')
      dv.facts.forEach(function (f) {
        const row = el('div', 'facts__row')
        row.appendChild(el('dt', null, f.label))
        row.appendChild(el('dd', null, f.value))
        host.appendChild(row)
      })
    }

    const rally = $('rally')
    rally.appendChild(document.createTextNode(D.RALLY.line + ' '))
    rally.appendChild(el('em', null, D.RALLY.lineEm))
  }

  /* ---- narrative ------------------------------------------------------- */

  function renderNarrative() {
    $('psyche-claim').textContent = D.PSYCHE.claim
    $('psyche-source').innerHTML = sourceLine(D.PSYCHE.source)
    $('psyche-note').textContent = D.PSYCHE.note

    $('fee-headline').textContent = D.FEES.headline
    $('fee-body').textContent = D.FEES.body
    $('fee-note').textContent = D.FEES.honestNote

    $('disclaimer').textContent = D.DISCLAIMER
  }

  /* ---- the beneficiary -------------------------------------------------- */

  function renderBeneficiary() {
    const b = D.BENEFICIARY
    if (!b) return

    $('bf-lead').textContent = b.lead
    $('bf-body').textContent = b.body
    $('bf-nostrings').textContent = b.noStrings

    $('bf-name').innerHTML = link(b.site, b.name) + ' &middot; ' + b.short

    const q = $('bf-quote')
    q.appendChild(el('p', 'bene__quote-text', '\u201c' + b.quote + '\u201d'))
    const cite = el('p', 'bene__quote-cite')
    cite.innerHTML = '\u2014 ' + link(b.site, 'PIPA, on its own science page')
    q.appendChild(cite)

    // Publish the EIN. The whole point is that anyone can repeat the check.
    const facts = $('bf-facts')
    const rows = [
      { label: 'Status', value: b.status },
      { label: 'EIN', value: b.ein, url: b.einCheck },
      { label: 'IRS ruling', value: b.ruling },
      { label: 'Registered', value: b.registered },
    ]
    rows.forEach(function (r) {
      const row = el('div', 'facts__row')
      row.appendChild(el('dt', null, r.label))
      const dd = el('dd')
      dd.appendChild(document.createTextNode(r.value))
      if (r.url) {
        const a = el('a', 'facts__src', 'verify')
        a.href = r.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        dd.appendChild(document.createTextNode(' '))
        dd.appendChild(a)
      }
      row.appendChild(dd)
      facts.appendChild(row)
    })

    const cav = $('bf-caveats')
    b.caveats.forEach(function (c) {
      cav.appendChild(el('li', null, c))
    })

    $('bf-donate').href = b.donate
    $('bf-site').href = b.site
  }

  /* ---- Korabiewice ----------------------------------------------------- */

  function renderShelter() {
    const s = D.SHELTER
    if (!s) return

    $('sh-lead').textContent = s.lead
    $('sh-body').textContent = s.body
    $('sh-bridge').textContent = s.bridge
    $('sh-nostrings').textContent = s.noStrings
    $('sh-disclaimer').textContent = s.disclaimer

    const name = $('sh-name')
    name.innerHTML =
      link(s.site, s.name) + ' &middot; ' + s.org + ' &middot; ' + link(s.x, 'X')

    $('sh-quote').textContent = '\u201c' + s.theirHeadlineEn + '\u201d'

    // Progress cannot be read live (no CORS on pomagam.pl), so it is stamped.
    const raised = Number(s.raised.replace(/\D/g, ''))
    const goal = Number(s.goal.replace(/\D/g, ''))
    const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0

    $('sh-fill').style.width = pct + '%'
    $('sh-bar-wrap').setAttribute(
      'aria-label',
      'Fundraiser progress: ' + pct + ' per cent of the goal raised',
    )

    $('sh-nums').innerHTML =
      '<strong>' + s.raised + ' ' + s.currency + '</strong> of ' + s.goal + ' '
      + s.currency + ' &middot; ' + pct + '% &middot; as checked ' + s.checkedOn
      + ' &middot; ' + link(s.fundraiser, 'live figure')

    $('sh-unit').innerHTML =
      '<strong>' + s.unit + '</strong> ' + s.unitClaim
      + ' They hold ' + s.animals + ' animals.'

    $('sh-donate').href = s.fundraiser
    $('sh-feed').href = s.feedUrl
  }

  /* ---- buy: funding venues, self-custody route, then the purchase ------ */

  function renderBuy() {
    $('buy-lead').textContent = D.BUY_INTRO.lead
    $('buy-intro').textContent = D.BUY_INTRO.body
    $('referral-disclosure').textContent = D.REFERRAL_DISCLOSURE

    // funding venues
    const vhost = $('venues')
    D.VENUES.forEach(function (v) {
      const card = el('div', 'venue')

      const head = el('div', 'venue__head')
      head.appendChild(el('h4', 'venue__name', v.name))
      if (v.badge) head.appendChild(el('span', 'venue__badge', v.badge))
      card.appendChild(head)

      card.appendChild(el('p', 'venue__tag', v.tag))

      const ol = el('ol', 'venue__steps')
      v.steps.forEach(function (s) {
        ol.appendChild(el('li', null, s))
      })
      card.appendChild(ol)

      const a = el('a', 'btn btn--dark venue__cta', v.cta)
      a.href = v.url
      a.target = '_blank'
      a.rel = 'noopener noreferrer sponsored'
      card.appendChild(a)

      vhost.appendChild(card)
    })

    // self-custody alternative
    const diy = $('diy')
    diy.appendChild(el('h4', 'diy__title', D.DIY.title))
    diy.appendChild(el('p', 'diy__body', D.DIY.body))
    const row = el('p', 'diy__links')
    D.DIY.links.forEach(function (l, i) {
      if (i) row.appendChild(document.createTextNode(' · '))
      const a = el('a', null, l.label)
      a.href = l.url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      row.appendChild(a)
    })
    diy.appendChild(row)

    // the purchase itself
    $('buy-final-head').textContent = 'Step two — ' + D.BUY_FINAL.title.toLowerCase()
    const host = $('steps')
    D.BUY_FINAL.steps.forEach(function (s, i) {
      const li = el('li')
      li.appendChild(el('span', 'steps__n', '0' + (i + 1)))
      const box = el('div')
      box.appendChild(el('p', null, s))
      li.appendChild(box)
      host.appendChild(li)
    })

    $('buy-later').textContent = D.BUY_FINAL.later
  }

  /* ---- contract + live chain facts ------------------------------------- */

  function renderContract() {
    $('ca-addr').textContent = D.TOKEN.address

    $('copy-ca').addEventListener('click', function () {
      const done = function (ok) {
        $('copy-ca-text').textContent = ok ? 'Copied' : 'Select it'
        setTimeout(function () {
          $('copy-ca-text').textContent = 'Copy'
        }, 1800)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(D.TOKEN.address).then(
          function () { done(true) },
          function () { done(false) },
        )
      } else {
        done(false)
      }
    })
  }

  const CHAIN_ROWS = [
    { key: 'name', label: 'Token name' },
    { key: 'symbol', label: 'Symbol' },
    { key: 'paired', label: 'Priced in' },
    { key: 'total_supply', label: 'Total supply' },
    { key: 'holders', label: 'Holders' },
    { key: 'transfers', label: 'Transfers' },
  ]

  function renderChainSkeleton() {
    const host = $('chain')
    CHAIN_ROWS.forEach(function (r) {
      const row = el('div', 'chain__row')
      row.appendChild(el('dt', null, r.label))
      const dd = el('dd', null, 'reading…')
      dd.setAttribute('data-state', 'loading')
      dd.id = 'chain-' + r.key
      row.appendChild(dd)
      host.appendChild(row)
    })
    setChain('paired', D.TOKEN.pairedWith)
  }

  function setChain(key, value) {
    const dd = $('chain-' + key)
    if (!dd) return
    dd.textContent = value
    dd.removeAttribute('data-state')
  }

  function chainError(msg) {
    CHAIN_ROWS.forEach(function (r) {
      if (r.key === 'paired') return
      const dd = $('chain-' + r.key)
      if (!dd) return
      dd.textContent = msg
      dd.setAttribute('data-state', 'error')
    })
  }

  function loadChainFacts() {
    const base = D.TOKEN.apiBase
    const addr = D.TOKEN.address

    Promise.all([
      fetch(base + '/tokens/' + addr).then(function (r) {
        if (!r.ok) throw new Error('token ' + r.status)
        return r.json()
      }),
      fetch(base + '/tokens/' + addr + '/counters').then(function (r) {
        if (!r.ok) throw new Error('counters ' + r.status)
        return r.json()
      }),
    ])
      .then(function (res) {
        const t = res[0]
        const c = res[1]

        setChain('name', t.name || '—')
        setChain('symbol', t.symbol || '—')

        if (t.total_supply && t.decimals != null) {
          const whole = t.total_supply.slice(
            0,
            Math.max(1, t.total_supply.length - Number(t.decimals)),
          )
          setChain('total_supply', fmt(Number(whole)))
        } else {
          setChain('total_supply', '—')
        }

        setChain('holders', fmt(Number(c.token_holders_count)))
        setChain('transfers', fmt(Number(c.transfers_count)))
      })
      .catch(function () {
        chainError('could not read — check Blockscout')
      })
  }

  /* ---- status board ---------------------------------------------------- */

  function renderStatus() {
    const host = $('status')
    D.STATUS.forEach(function (s) {
      const li = el('li', 'status__item')
      li.setAttribute('data-state', s.state)

      const head = el('div', 'status__head')
      head.appendChild(
        el('span', 'status__tag', s.state === 'confirmed' ? 'Confirmed' : 'Not yet'),
      )
      li.appendChild(head)

      li.appendChild(el('p', 'status__claim', s.claim))
      li.appendChild(el('p', 'status__detail', s.detail))

      if (s.source) {
        const labels = {
          blockscout: 'Blockscout',
          einCheck: 'IRS records',
          pipa: 'ponipa.org',
          ucdavisPon: 'UC Davis',
        }
        const src = el('p', 'status__src')
        src.innerHTML =
          'Verify: ' + link(D.SOURCES[s.source].url, labels[s.source] || 'source')
        li.appendChild(src)
      }
      host.appendChild(li)
    })
  }

  /* ---- withheld -------------------------------------------------------- */

  function renderWithheld() {
    const host = $('withheld')
    D.WITHHELD.forEach(function (w) {
      const li = el('li')
      li.appendChild(el('h4', null, w.figure))
      li.appendChild(el('p', null, w.reason))
      host.appendChild(li)
    })
  }

  /* ---- ledger ---------------------------------------------------------- */

  function renderLedger() {
    const host = $('ledger')
    if (D.LEDGER.length === 0) {
      const box = el('div', 'ledger-empty')
      box.appendChild(el('p', 'ledger-empty__mark', '—'))
      box.appendChild(
        el(
          'p',
          null,
          'No donation has been made. This table is empty on purpose, and it '
            + 'stays empty until there is a transaction hash and a receipt to '
            + 'put in it.',
        ),
      )
      host.appendChild(box)
    }
  }

  /* ---- plates ---------------------------------------------------------- */

  function renderPlates() {
    const host = $('plates')
    D.PHOTOS.forEach(function (p) {
      const fig = el('figure', 'plate')
      const img = document.createElement('img')
      img.src = 'img/' + p.file
      img.alt = p.alt
      img.loading = 'lazy'
      img.decoding = 'async'
      fig.appendChild(img)

      const cap = el('figcaption')
      cap.innerHTML =
        p.author
        + ' · ' + link(p.licenseUrl, p.license)
        + ' · ' + link(p.source, 'Commons')
      fig.appendChild(cap)
      host.appendChild(fig)
    })
  }

  /* ---- go -------------------------------------------------------------- */

  renderBuyLinks()
  initBar()
  renderRegistry()
  renderMarks()
  renderSire()
  renderNarrative()
  renderBeneficiary()
  renderShelter()
  renderBuy()
  renderContract()
  renderChainSkeleton()
  renderStatus()
  renderWithheld()
  renderLedger()
  renderPlates()
  loadChainFacts()
})()
