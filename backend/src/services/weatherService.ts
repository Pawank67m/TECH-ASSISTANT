import axios from 'axios'

export async function getWeather(city: string): Promise<string> {
  try {
    // wttr.in is free, no API key required
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(city)}`, {
      params: { format: 'j1' },
      timeout: 10000,
    })
    const data = res.data
    const current = data.current_condition?.[0]
    if (!current) throw new Error('No weather data returned.')

    const temp = current.temp_C
    const desc = current.weatherDesc?.[0]?.value ?? 'unknown'
    const humidity = current.humidity
    const area = data.nearest_area?.[0]?.areaName?.[0]?.value ?? city

    return `Weather in ${area}: ${temp}°C, ${desc}, humidity ${humidity}%`
  } catch (err: any) {
    if (err.response?.status === 404 || err.response?.status === 400) {
      throw new Error(`City "${city}" not found.`)
    }
    throw new Error('Weather service unavailable.')
  }
}
