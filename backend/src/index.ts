import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import chatRouter from './routes/chat'
import weatherRouter from './routes/weather'
import openAppRouter from './routes/openApp'

const REQUIRED_ENV = ['GEMINI_API_KEY', 'FRONTEND_ORIGIN']
REQUIRED_ENV.forEach(key => {
  if (!process.env[key]) console.warn(`Warning: Missing environment variable ${key}`)
})

const app = express()

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? '*' }))
app.use(express.json())

app.use('/api/chat', chatRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/open-app', openAppRouter)

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// Only start listening when run directly, not when imported by tests
if (require.main === module) {
  const PORT = process.env.PORT ?? 3001
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
}

export default app
