/* $PONCOIN — page wiring. All content comes from data.js. */

;(function () {
  'use strict'

  const D = window.PON
  const $ = (id) => document.getElementById(id)

  function el(tag, cls, text) {
    const n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }

  /* ---- links ----------------------------------------------------------- */

  ;['nav-buy', 'hero-buy', 'foot-buy'].forEach(function (id) {
    const a = $(id)
    if (a) a.href = D.TOKEN.buyUrl
  })
  ;['nav-x', 'foot-x'].forEach(function (id) {
    const a = $(id)
    if (a && D.TOKEN.x) a.href = D.TOKEN.x
  })
  $('donate').href = D.BENEFICIARY.donate
  $('pipa-site').href = D.BENEFICIARY.site
  $('foot-scan').href = D.TOKEN.explorer

  /* ---- contract ------------------------------------------------------- */

  const addr = D.TOKEN.address
  $('ca-text').textContent = addr.slice(0, 12) + '…' + addr.slice(-10)
  $('foot-ca').textContent = addr

  $('ca-copy').addEventListener('click', function () {
    const btn = $('ca-copy')
    const done = function (ok) {
      $('ca-text').textContent = ok ? 'Copied' : 'Copy failed'
      setTimeout(function () {
        $('ca-text').textContent = addr.slice(0, 12) + '…' + addr.slice(-10)
      }, 1500)
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(addr).then(function () { done(true) }, function () { done(false) })
    } else {
      done(false)
    }
    void btn
  })

  /* ---- the 150 --------------------------------------------------------- */

  ;(function dots() {
    const host = $('dots')
    const founders = [37, 92]
    const frag = document.createDocumentFragment()
    for (let i = 0; i < D.BOTTLENECK.survivors; i++) {
      frag.appendChild(el('span', 'dot' + (founders.indexOf(i) !== -1 ? ' on' : '')))
    }
    host.appendChild(frag)

    const marks = host.querySelectorAll('.dot')
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Visible by default. Only opt into the hidden state if we can reveal them.
    if (reduced || !('IntersectionObserver' in window)) return
    host.classList.add('anim')

    let done = false
    const run = function () {
      if (done) return
      done = true
      marks.forEach(function (m, i) {
        setTimeout(function () { m.classList.add('in') }, (i / marks.length) * 700)
      })
    }
    const io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect() } })
    }, { threshold: 0.15 })
    io.observe(host)
    setTimeout(run, 2200)
  })()

  /* ---- receipts -------------------------------------------------------- */

  ;(function ledger() {
    const host = $('ledger')
    if (!D.LEDGER || D.LEDGER.length === 0) {
      const box = el('div', 'soon')
      box.appendChild(el('p', 'soon__tag', 'Receipt 001'))
      box.appendChild(el('p', 'soon__h', 'Updated soon.'))
      box.appendChild(
        el('p', 'soon__p', 'The donation tracker goes live here. Every receipt photographed, every total checkable.'),
      )
      host.appendChild(box)
      return
    }

    let total = 0
    const list = el('div', 'grid')
    D.LEDGER.forEach(function (r, i) {
      total += Number(String(r.amount).replace(/[^\d.]/g, '')) || 0
      const row = el('a', 'receipt')
      row.href = r.receipt
      row.target = '_blank'
      row.rel = 'noopener noreferrer'
      row.appendChild(el('span', 'receipt__n', ('00' + (i + 1)).slice(-3)))
      const b = el('div')
      b.appendChild(el('p', 'receipt__a', r.amount + ' → ' + r.org))
      b.appendChild(el('p', 'receipt__m', r.date + (r.note ? ' · ' + r.note : '')))
      row.appendChild(b)
      row.appendChild(el('span', 'receipt__v', 'View'))
      list.appendChild(row)
    })
    host.appendChild(list)
    const sum = el('p', 'tiny')
    sum.textContent = 'Donated to date: $' + total.toLocaleString('en-US')
    host.appendChild(sum)
  })()

  /* ---- scroll reveal ---------------------------------------------------- */

  ;(function reveal() {
    const items = Array.prototype.slice.call(document.querySelectorAll('.rev'))
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // If we cannot observe, show everything. Content never hides behind JS.
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('seen') })
      return
    }

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return
          e.target.classList.add('seen')
          io.unobserve(e.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach(function (n) { io.observe(n) })
  })()
})()
