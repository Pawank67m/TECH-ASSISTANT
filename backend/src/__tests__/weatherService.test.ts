import axios from 'axios'
import { getWeather } from '../services/weatherService'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

const mockResponse = {
  data: {
    current_condition: [{ temp_C: '12', weatherDesc: [{ value: 'Partly cloudy' }], humidity: '78' }],
    nearest_area: [{ areaName: [{ value: 'London' }] }],
  },
}

describe('weatherService', () => {
  it('returns formatted weather string on success', async () => {
    mockedAxios.get.mockResolvedValueOnce(mockResponse)
    const result = await getWeather('London')
    expect(result).toBe('Weather in London: 12°C, Partly cloudy, humidity 78%')
  })

  it('throws city not found on 404', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } })
    await expect(getWeather('Fakecity')).rejects.toThrow('not found')
  })

  it('throws service unavailable on other errors', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getWeather('London')).rejects.toThrow('unavailable')
  })
})
