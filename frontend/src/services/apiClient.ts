import axios from 'axios'
import type { Message } from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const client = axios.create({ baseURL: BASE_URL, timeout: 35000 })

export async function sendMessage(message: string, history: Message[]): Promise<string> {
  const cappedHistory = history.slice(-10)
  try {
    const res = await client.post<{ response: string }>('/api/chat', {
      message,
      history: cappedHistory,
    })
    return res.data.response
  } catch (err: any) {
    if (err.response?.data?.error) throw new Error(err.response.data.error)
    throw new Error('Service unavailable, please try again.')
  }
}

export async function getWeather(city: string): Promise<string> {
  try {
    const res = await client.get<{ weather: string }>('/api/weather', { params: { city } })
    return res.data.weather
  } catch (err: any) {
    if (err.response?.data?.error) throw new Error(err.response.data.error)
    throw new Error('Weather service unavailable, please try again.')
  }
}

export async function openApp(app: string): Promise<string> {
  try {
    const res = await client.post<{ message: string }>('/api/open-app', { app })
    return res.data.message
  } catch (err: any) {
    if (err.response?.data?.error) throw new Error(err.response.data.error)
    throw new Error(`Could not open ${app}.`)
  }
}
