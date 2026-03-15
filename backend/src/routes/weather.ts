import { Router, Request, Response } from 'express'
import { getWeather } from '../services/weatherService'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const city = req.query.city as string | undefined
  if (!city) {
    res.status(400).json({ error: 'Missing required query parameter: city' })
    return
  }
  try {
    const weather = await getWeather(city)
    res.json({ weather })
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
})

export default router
