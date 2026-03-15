import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { handle } from '../services/commandHandler'

describe('commandHandler — unit tests', () => {
  it('detects "open youtube"', () => {
    const r = handle('open youtube please')
    expect(r.type).toBe('open_url')
    if (r.type === 'open_url') expect(r.url).toBe('https://www.youtube.com')
  })

  it('detects "open google"', () => {
    const r = handle('open google now')
    expect(r.type).toBe('open_url')
    if (r.type === 'open_url') expect(r.url).toBe('https://www.google.com')
  })

  it('detects search command', () => {
    const r = handle('search TypeScript tutorials')
    expect(r.type).toBe('search')
    if (r.type === 'search') expect(r.query).toBe('typescript tutorials')
  })

  it('detects "what time is it"', () => {
    const r = handle('what time is it')
    expect(r.type).toBe('time')
    if (r.type === 'time') expect(r.message).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
  })

  it('detects "current date"', () => {
    const r = handle('current date')
    expect(r.type).toBe('date')
  })

  it('detects "weather in London"', () => {
    const r = handle('weather in London')
    expect(r.type).toBe('weather')
    if (r.type === 'weather') expect(r.city).toBe('london')
  })

  it('detects "weather of Paris"', () => {
    const r = handle('weather of Paris')
    expect(r.type).toBe('weather')
    if (r.type === 'weather') expect(r.city).toBe('paris')
  })

  it('returns none for unrecognised input', () => {
    expect(handle('tell me a joke').type).toBe('none')
  })
})

describe('commandHandler — property tests', () => {
  // Feature: ai-voice-assistant, Property 7: URL command detection
  it('Property 7: any transcript with "open youtube" returns open_url with youtube URL', () => {
    fc.assert(fc.property(
      fc.string(), fc.string(),
      (pre, post) => {
        const r = handle(`${pre} open youtube ${post}`)
        return r.type === 'open_url' && (r as any).url === 'https://www.youtube.com'
      }
    ))
  })

  it('Property 7: any transcript with "open google" returns open_url with google URL', () => {
    fc.assert(fc.property(
      fc.string(), fc.string(),
      (pre, post) => {
        const r = handle(`${pre} open google ${post}`)
        return r.type === 'open_url' && (r as any).url === 'https://www.google.com'
      }
    ))
  })

  // Feature: ai-voice-assistant, Property 8: Search command extraction
  it('Property 8: "search [query]" extracts query correctly', () => {
    fc.assert(fc.property(
      fc.stringMatching(/^[a-z][a-z0-9 ]{1,20}$/),
      (query) => {
        const r = handle(`search ${query}`)
        return r.type === 'search' && (r as any).query === query.trim()
      }
    ))
  })

  // Feature: ai-voice-assistant, Property 9: Time and date commands produce formatted responses
  it('Property 9: time command message matches HH:MM AM/PM format', () => {
    const timePhrases = ['what time is it', 'what is the time', 'current time']
    timePhrases.forEach(phrase => {
      const r = handle(phrase)
      expect(r.type).toBe('time')
      if (r.type === 'time') expect(r.message).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
    })
  })

  it('Property 9: date command message is non-empty string', () => {
    const datePhrases = ["what is the date", "today's date", "current date"]
    datePhrases.forEach(phrase => {
      const r = handle(phrase)
      expect(r.type).toBe('date')
      if (r.type === 'date') expect(r.message.length).toBeGreaterThan(0)
    })
  })

  // Feature: ai-voice-assistant, Property 10: Weather command extracts city
  it('Property 10: "weather in [city]" extracts city', () => {
    fc.assert(fc.property(
      fc.stringMatching(/^[a-zA-Z]{3,15}$/),
      (city) => {
        const r = handle(`weather in ${city}`)
        return r.type === 'weather' && (r as any).city === city.toLowerCase()
      }
    ))
  })

  it('Property 10: "weather of [city]" extracts city', () => {
    fc.assert(fc.property(
      fc.stringMatching(/^[a-zA-Z]{3,15}$/),
      (city) => {
        const r = handle(`weather of ${city}`)
        return r.type === 'weather' && (r as any).city === city.toLowerCase()
      }
    ))
  })

  // Feature: ai-voice-assistant, Property 11: All command results carry a non-empty message
  it('Property 11: matched commands always have non-empty message', () => {
    const inputs = [
      'open youtube', 'open google', 'search cats',
      'what time is it', 'current date', 'weather in Rome',
    ]
    inputs.forEach(input => {
      const r = handle(input)
      if (r.type !== 'none') {
        expect((r as any).message).toBeTruthy()
      }
    })
  })
})
