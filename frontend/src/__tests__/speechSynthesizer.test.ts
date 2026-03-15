import { describe, it, expect, vi } from 'vitest'
import { speak } from '../services/speechSynthesizer'

describe('speechSynthesizer', () => {
  it('calls onEnd immediately when synth is undefined', () => {
    const onEnd = vi.fn()
    speak('hello', onEnd, undefined)
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('calls synth.speak with an utterance at rate 1.0', () => {
    const mockSpeak = vi.fn()
    const onEnd = vi.fn()
    speak('hello world', onEnd, { speak: mockSpeak })
    expect(mockSpeak).toHaveBeenCalledOnce()
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('hello world')
    expect(utterance.rate).toBe(1.0)
  })

  it('calls onEnd when utterance onend fires', () => {
    const mockSpeak = vi.fn()
    const onEnd = vi.fn()
    speak('test', onEnd, { speak: mockSpeak })
    const utterance: SpeechSynthesisUtterance = mockSpeak.mock.calls[0][0]
    ;(utterance as any).onend()
    expect(onEnd).toHaveBeenCalledOnce()
  })
})
