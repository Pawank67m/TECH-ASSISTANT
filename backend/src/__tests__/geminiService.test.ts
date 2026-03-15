import { generateResponse } from '../services/geminiService'

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'Mocked response' },
        }),
      }),
    })),
  }
})

describe('geminiService', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
  })

  it('returns response text on success', async () => {
    const result = await generateResponse('Hello', [])
    expect(result).toBe('Mocked response')
  })

  it('throws when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY
    await expect(generateResponse('Hello', [])).rejects.toThrow('GEMINI_API_KEY')
  })

  it('throws on API failure', async () => {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    GoogleGenerativeAI.mockImplementationOnce(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn().mockRejectedValue(new Error('API error')),
      }),
    }))
    await expect(generateResponse('Hello', [])).rejects.toThrow('API error')
  })
})
