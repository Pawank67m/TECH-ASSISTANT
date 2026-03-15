import { Router, Request, Response } from 'express'
import { generateResponse } from '../services/geminiService'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { message, history } = req.body
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing required field: message' })
    return
  }
  try {
    const response = await generateResponse(message, history ?? [])
    res.json({ response })
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
})

export default router
