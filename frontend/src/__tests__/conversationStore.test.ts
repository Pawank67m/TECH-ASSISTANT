import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Mock firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
}))

const mockMessages: Record<string, any> = {}
const mockSetDoc = vi.fn(async (_ref: any, data: any) => {
  mockMessages[data.id] = data
})
const mockGetDocs = vi.fn(async () => ({
  docs: Object.values(mockMessages).map((d: any) => ({ data: () => d })),
}))
const mockDoc = vi.fn((_db: any, ...path: string[]) => ({ path: path.join('/') }))
const mockCollection = vi.fn()
const mockQuery = vi.fn((...args: any[]) => args[0])
const mockOrderBy = vi.fn()
const mockGetFirestore = vi.fn(() => ({}))

vi.mock('firebase/firestore', () => ({
  getFirestore: mockGetFirestore,
  collection: mockCollection,
  getDocs: mockGetDocs,
  orderBy: mockOrderBy,
  query: mockQuery,
  doc: mockDoc,
  setDoc: mockSetDoc,
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('conversationStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    Object.keys(mockMessages).forEach(k => delete mockMessages[k])
    vi.clearAllMocks()
    vi.resetModules()
  })

  // Feature: ai-voice-assistant, Property 15: Session ID uniqueness
  it('Property 15: two fresh initSession() calls return different IDs', async () => {
    await fc.assert(fc.asyncProperty(
      fc.constant(null),
      async () => {
        localStorageMock.clear()
        vi.resetModules()
        const { initSession } = await import('../services/conversationStore')
        const id1 = initSession()
        localStorageMock.clear()
        vi.resetModules()
        const { initSession: initSession2 } = await import('../services/conversationStore')
        const id2 = initSession2()
        return id1 !== id2
      }
    ), { numRuns: 20 })
  })

  // Feature: ai-voice-assistant, Property 16: Message persistence round-trip
  it('Property 16: saveMessage then loadHistory returns the saved message', async () => {
    const { saveMessage, loadHistory } = await import('../services/conversationStore')
    const msg = { id: 'test-id', role: 'user' as const, content: 'hello', timestamp: 1000 }
    await saveMessage('session1', msg)
    const history = await loadHistory('session1')
    expect(history.some(m => m.id === msg.id)).toBe(true)
  })

  // Feature: ai-voice-assistant, Property 17: Firestore path correctness
  it('Property 17: saveMessage writes to correct Firestore path', async () => {
    const { saveMessage } = await import('../services/conversationStore')
    const msg = { id: 'msg-abc', role: 'assistant' as const, content: 'hi', timestamp: 2000 }
    await saveMessage('sess-xyz', msg)
    expect(mockDoc).toHaveBeenCalledWith(
      expect.anything(), 'sessions', 'sess-xyz', 'messages', 'msg-abc'
    )
  })

  it('initSession returns same ID on second call', async () => {
    const { initSession } = await import('../services/conversationStore')
    const id1 = initSession()
    const id2 = initSession()
    expect(id1).toBe(id2)
  })

  it('loadHistory returns empty array on Firestore failure', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'))
    const { loadHistory } = await import('../services/conversationStore')
    const result = await loadHistory('bad-session')
    expect(result).toEqual([])
  })
})
