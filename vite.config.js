import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev only: run the Vercel functions in api/*.js inside the Vite server (production uses Vercel itself).
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = req.url.match(/^\/api\/([a-z-]+)(?:\?|$)/)
        if (!m) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`)
          req.query = Object.fromEntries(new URL(req.url, 'http://x').searchParams)
          res.status = code => { res.statusCode = code; return res }
          res.json = obj => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
          await mod.default(req, res)
        } catch (e) { console.error(e); res.statusCode = 500; res.end(JSON.stringify({ error: 'dev api error' })) }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))  // server-side vars for the dev api
  return {
    plugins: [react(), devApi()],
    server: { port: 5174, host: true },
    preview: { port: 4174, host: true },
  }
})
