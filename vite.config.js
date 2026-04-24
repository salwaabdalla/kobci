import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import coachHandler from './api/coach.js'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''

    req.on('data', (chunk) => {
      raw += chunk
    })

    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      {
        name: 'local-api-coach',
        configureServer(server) {
          server.middlewares.use('/api/coach', async (req, res, next) => {
            if (req.method !== 'POST') {
              return next()
            }

            try {
              req.body = await readJsonBody(req)
              await coachHandler(req, res)
            } catch (error) {
              console.error('Local /api/coach middleware failed:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error.message || 'AI unavailable. Please try again later.' }))
            }
          })
        },
      },
    ],
    server: {
      port: 5173,
    },
  }
})
