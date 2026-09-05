/*
 * Minimal static file server for local preview.
 * Plain node, no dependencies — npx/.cmd spawning is unreliable under the
 * tunnel wrapper on Windows.
 *
 *   node server.mjs [port]
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)))
const PORT = Number(process.argv[2] || process.env.PORT || 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'

    // keep every request inside ROOT
    const target = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ''))
    if (!target.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    const info = await stat(target)
    const file = info.isDirectory()
      ? join(target, 'index.html')
      : target

    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`Serving ${ROOT}`)
  console.log(`Local:   http://localhost:${PORT}`)
})
