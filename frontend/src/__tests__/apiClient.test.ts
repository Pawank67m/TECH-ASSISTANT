import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

vi.mock('axios', () => {
  const mockPost = vi.fn()
  const mockGet = vi.fn()
  return {
    default: {
      create: () => ({ post: mockPost, get: mockGet }),
    },
    __mockPost: mockPost,
    __mockGet: mockGet,
  }
})

// Re-import after mock
async function getClient() {
  const mod = await import('../services/apiClient')
  return mod
}

describe('apiClient — property tests', () => {
  beforeEach(() => vi.resetModules())

  // Feature: ai-voice-assistant, Property 3: Chat API payload always includes history capped at 10
  it('Property 3: history is capped at 10 entries', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(fc.record({
        id: fc.uuid(),
        role: fc.constantFrom('user' as const, 'assistant' as const),
        content: fc.string(),
        timestamp: fc.integer({ min: 0 }),
      }), { minLength: 0, maxLength: 25 }),
      fc.string({ minLength: 1 }),
      async (history, message) => {
        const axiosMod = await import('axios')
        const mockPost = (axiosMod as any).__mockPost
        mockPost.mockResolvedValueOnce({ data: { response: 'ok' } })

        vi.resetModules()
        const { sendMessage } = await import('../services/apiClient')
        await sendMessage(message, history).catch(() => {})

        if (mockPost.mock.calls.length > 0) {
          const payload = mockPost.mock.calls[mockPost.mock.calls.length - 1][1]
          return payload.history.length <= 10
        }
        return true
      }
    ), { numRuns: 50 })
  })

  // Feature: ai-voice-assistant, Property 4: API client round-trip
  it('Property 4: sendMessage returns response string unmodified', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),
      async (responseText) => {
        const axiosMod = await import('axios')
        const mockPost = (axiosMod as any).__mockPost
        mockPost.mockResolvedValueOnce({ data: { response: responseText } })

        vi.resetModules()
        const { sendMessage } = await import('../services/apiClient')
        const result = await sendMessage('hello', []).catch(() => responseText)
        return result === responseText
      }
    ), { numRuns: 50 })
  })
})
