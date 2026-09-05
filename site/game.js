/*
 * "Spot the PON" — five rounds, tap the Polish Lowland Sheepdog.
 *
 * The distractor breeds are ordered by how close they actually look, easiest
 * first. The last round is the Bearded Collie, which is close enough that
 * missing it is the intended experience — that is what sets up the payoff.
 *
 * Photo pool and attribution come from game-data.js (generated).
 */

;(function () {
  'use strict'

  const POOL = window.PON_GAME_PHOTOS || []
  const root = document.getElementById('game-root')
  if (!root || POOL.length === 0) return

  const ROUNDS = [
    {
      breed: 'oes',
      name: 'Old English Sheepdog',
      article: 'an',
      note:
        'Bigger, heavier, and usually far whiter. Traditionally docked, which '
        + 'is why it is nicknamed the Bobtail.',
    },
    {
      breed: 'briard',
      name: 'Briard',
      note: 'French, taller, and almost always fawn or solid black.',
    },
    {
      breed: 'bergamasco',
      name: 'Bergamasco Shepherd',
      note:
        'Italian. Its coat mats into flat felted slabs rather than hair — once '
        + 'you have seen it you cannot unsee it.',
    },
    {
      breed: 'schapendoes',
      name: 'Schapendoes',
      note:
        'The Dutch shaggy sheepdog. This is the closest thing to a PON that '
        + 'is not one.',
    },
    {
      breed: 'beardie',
      name: 'Bearded Collie',
      note:
        'Scottish. Breed lore says PONs left in Scotland in 1514 helped make '
        + 'this dog — historians argue about the direction. Either way, look '
        + 'at them.',
    },
  ]

  const byBreed = {}
  POOL.forEach(function (p) {
    ;(byBreed[p.breed] = byBreed[p.breed] || []).push(p)
  })

  let round = 0
  let score = 0
  let results = []   // per-round hit/miss, drives the share squares
  let locked = false

  function shuffle(a) {
    const c = a.slice()
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[c[i], c[j]] = [c[j], c[i]]
    }
    return c
  }

  function pick(arr, n) {
    return shuffle(arr).slice(0, n)
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag)
    if (cls) n.className = cls
    if (text != null) n.textContent = text
    return n
  }

  function credit(p) {
    return (
      p.author
      + ' · <a href="' + p.licenseUrl + '" target="_blank" rel="noopener noreferrer">'
      + p.license + '</a>'
    )
  }

  /* ---- intro ----------------------------------------------------------- */

  function renderIntro() {
    root.innerHTML = ''
    const box = el('div', 'game__intro')
    box.appendChild(el('p', 'game__kicker', 'Five rounds · about 20 seconds'))
    box.appendChild(
      el('h3', 'game__title', 'Can you pick the Polish Lowland Sheepdog?'),
    )
    box.appendChild(
      el(
        'p',
        'game__sub',
        'Every other dog is a real breed that gets mistaken for one. They get '
          + 'harder as you go.',
      ),
    )
    const btn = el('button', 'btn btn--buy btn--lg', 'Start')
    btn.type = 'button'
    btn.addEventListener('click', function () {
      round = 0
      score = 0
      results = []
      renderRound()
    })
    box.appendChild(btn)
    root.appendChild(box)
  }

  /* ---- a round --------------------------------------------------------- */

  function renderRound() {
    locked = false
    root.innerHTML = ''

    const cfg = ROUNDS[round]
    const pons = byBreed.pon || []
    const others = byBreed[cfg.breed] || []
    if (pons.length === 0 || others.length < 3) {
      renderIntro()
      return
    }

    const answer = pick(pons, 1)[0]
    const tiles = shuffle([answer].concat(pick(others, 3)))

    // progress
    const head = el('div', 'game__head')
    head.appendChild(el('p', 'game__kicker', 'Round ' + (round + 1) + ' of ' + ROUNDS.length))
    const bar = el('div', 'game__bar')
    for (let i = 0; i < ROUNDS.length; i++) {
      const seg = el('span', 'game__seg' + (i < round ? ' is-done' : i === round ? ' is-now' : ''))
      bar.appendChild(seg)
    }
    head.appendChild(bar)
    root.appendChild(head)

    root.appendChild(el('h3', 'game__prompt', 'Which one is the PON?'))

    const grid = el('div', 'game__grid')
    tiles.forEach(function (p) {
      const btn = el('button', 'tile')
      btn.type = 'button'
      btn.setAttribute('aria-label', 'Dog photo — tap if you think this is the Polish Lowland Sheepdog')

      const img = document.createElement('img')
      img.src = 'img/game/' + p.file
      img.alt = ''
      img.loading = 'lazy'
      img.decoding = 'async'
      btn.appendChild(img)

      const badge = el('span', 'tile__badge')
      btn.appendChild(badge)

      btn.addEventListener('click', function () {
        answered(btn, p, answer, cfg, grid)
      })
      grid.appendChild(btn)
    })
    root.appendChild(grid)

    const cred = el('p', 'game__credits')
    cred.innerHTML = 'Photos: ' + tiles.map(credit).join(' · ')
    root.appendChild(cred)
  }

  /* ---- answer ---------------------------------------------------------- */

  function answered(btn, picked, answer, cfg, grid) {
    if (locked) return
    locked = true

    const right = picked.file === answer.file
    results[round] = right
    if (right) score++

    Array.prototype.forEach.call(grid.children, function (t, i) {
      t.disabled = true
      const img = t.querySelector('img')
      const isAnswer = img.src.indexOf(answer.file) !== -1
      if (isAnswer) {
        t.classList.add('is-answer')
        t.querySelector('.tile__badge').textContent = 'PON'
      } else {
        t.classList.add('is-dim')
      }
    })
    if (!right) {
      btn.classList.remove('is-dim')
      btn.classList.add('is-wrong')
      btn.querySelector('.tile__badge').textContent = cfg.name
    }

    const fb = el('div', 'game__feedback' + (right ? ' is-right' : ''))
    fb.appendChild(
      el(
        'p',
        'game__verdict',
        right ? 'Correct.' : 'That was ' + (cfg.article || 'a') + ' ' + cfg.name + '.',
      ),
    )
    fb.appendChild(el('p', 'game__note', cfg.note))

    const next = el('button', 'btn btn--buy', round === ROUNDS.length - 1 ? 'See result' : 'Next round')
    next.type = 'button'
    next.addEventListener('click', function () {
      round++
      if (round >= ROUNDS.length) renderResult()
      else renderRound()
    })
    fb.appendChild(next)
    root.appendChild(fb)
    next.focus()
  }

  /* ---- result ---------------------------------------------------------- */

  function renderResult() {
    root.innerHTML = ''
    const box = el('div', 'game__result')

    box.appendChild(el('p', 'game__kicker', 'Result'))
    const s = el('p', 'game__score')
    s.innerHTML = '<strong>' + score + '</strong> / ' + ROUNDS.length
    box.appendChild(s)

    let line
    if (score === ROUNDS.length) line = 'Nobody gets five. Go on then.'
    else if (score >= 3) line = 'Better than most people manage.'
    else line = 'Do not feel bad. That is the entire point.'
    box.appendChild(el('p', 'game__verdict', line))

    box.appendChild(
      el(
        'p',
        'game__payoff',
        'The only thing that reliably separates a PON from a dog that looks '
          + 'exactly like one is a piece of paper. Polish shelters list dogs as '
          + '“w typie PON” — PON-type. Those are the ones nobody is on a '
          + 'waiting list for.',
      ),
    )

    // A volunteer at a Polish shelter, writing an advert for a mongrel nobody
    // was adopting, made this argument better than we can. Their words.
    const quote = el('blockquote', 'game__quote')
    quote.appendChild(
      el(
        'p',
        'game__quote-pl',
        '“Pezet prawie owczarek, nawet uszy mu stoją \u{1F642} wcale nie jest '
          + 'gorszy od tych z papierami \u{1F642}”',
      ),
    )
    quote.appendChild(
      el(
        'p',
        'game__quote-en',
        '“Pezet is almost a shepherd, his ears even stand up. He is not one bit '
          + 'worse than the ones with papers.”',
      ),
    )
    const cite = el('p', 'game__quote-cite')
    cite.innerHTML =
      'A volunteer at '
      + '<a href="https://zoodoptuj.pl/zwierzak/pies/19061-owczarek-mix-pezet" target="_blank" rel="noopener noreferrer">'
      + 'Schronisko Medor, Zgierz</a>, advertising a mongrel for adoption.'
    quote.appendChild(cite)
    box.appendChild(quote)

    const row = el('div', 'game__actions')

    const again = el('button', 'btn btn--ghost', 'Play again')
    again.type = 'button'
    again.addEventListener('click', function () {
      round = 0
      score = 0
      results = []
      renderRound()
    })
    row.appendChild(again)

    const share = el('button', 'btn btn--ghost', 'Copy result')
    share.type = 'button'
    share.addEventListener('click', function () {
      shareResult(share)
    })
    row.appendChild(share)

    const buy = el('a', 'btn btn--buy', 'Buy $PON')
    buy.href = window.PON && window.PON.TOKEN ? window.PON.TOKEN.buyUrl : '#buy'
    buy.target = '_blank'
    buy.rel = 'noopener noreferrer'
    row.appendChild(buy)

    box.appendChild(row)
    root.appendChild(box)
  }

  /* ---- share ----------------------------------------------------------- */

  function shareText() {
    const blocks = []
    for (let i = 0; i < ROUNDS.length; i++) {
      blocks.push(results[i] ? '\u{1F7E5}' : '\u2B1C')
    }
    return (
      'Spot the PON \u2014 ' + score + '/' + ROUNDS.length + '\n'
      + blocks.join('') + '\n'
      + 'The other three had papers.\n'
      + location.origin + location.pathname + '#game'
    )
  }

  function shareResult(btn) {
    const text = shareText()

    const label = function (msg) {
      btn.textContent = msg
      setTimeout(function () {
        btn.textContent = 'Copy result'
      }, 1800)
    }

    const toClipboard = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { label('Copied') },
          function () { label('Copy failed') },
        )
      } else {
        label('Copy failed')
      }
    }

    // navigator.share exists on plenty of desktop browsers and rejects when
    // dismissed or when it needs a stricter user gesture. Never leave the
    // button dead — always fall through to the clipboard.
    if (navigator.share) {
      let settled = false
      try {
        navigator.share({ text: text }).then(
          function () {
            settled = true
            label('Shared')
          },
          function () {
            if (!settled) toClipboard()
          },
        )
        return
      } catch (e) {
        toClipboard()
        return
      }
    }
    toClipboard()
  }

  renderIntro()
})()
