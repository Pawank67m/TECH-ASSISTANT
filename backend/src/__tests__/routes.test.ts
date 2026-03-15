import request from 'supertest'
import express from 'express'
import cors from 'cors'
import chatRouter from '../routes/chat'
import weatherRouter from '../routes/weather'

jest.mock('../services/geminiService', () => ({
  generateResponse: jest.fn().mockResolvedValue('Test AI response'),
}))
jest.mock('../services/weatherService', () => ({
  getWeather: jest.fn().mockResolvedValue('Weather in London: 12°C, partly cloudy, humidity 78%'),
}))

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/chat', chatRouter)
app.use('/api/weather', weatherRouter)

describe('POST /api/chat', () => {
  it('returns 200 with response field for valid body', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Hello', history: [] })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('response', 'Test AI response')
  })

  it('returns 400 when message is missing', async () => {
    const res = await request(app).post('/api/chat').send({ history: [] })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('includes CORS header', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'Hi' })
    expect(res.headers['access-control-allow-origin']).toBeDefined()
  })
})

describe('GET /api/weather', () => {
  it('returns 200 with weather field for valid city', async () => {
    const res = await request(app).get('/api/weather?city=London')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('weather')
  })

  it('returns 400 when city is missing', async () => {
    const res = await request(app).get('/api/weather')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
