import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as fc from 'fast-check'
import ChatInterface from '../components/ChatInterface'
import MessageBubble from '../components/MessageBubble'
import type { Message } from '../types'

const baseProps = {
  messages: [],
  isListening: false,
  isLoading: false,
  isSpeaking: false,
  onSendText: vi.fn(),
  onMicToggle: vi.fn(),
}

describe('ChatInterface — unit tests', () => {
  it('renders text input field', () => {
    render(<ChatInterface {...baseProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('calls onSendText when form is submitted', () => {
    const onSendText = vi.fn()
    render(<ChatInterface {...baseProps} onSendText={onSendText} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.submit(input.closest('form')!)
    expect(onSendText).toHaveBeenCalledWith('Hello')
  })

  it('does not call onSendText for empty input', () => {
    const onSendText = vi.fn()
    render(<ChatInterface {...baseProps} onSendText={onSendText} />)
    const input = screen.getByRole('textbox')
    fireEvent.submit(input.closest('form')!)
    expect(onSendText).not.toHaveBeenCalled()
  })
})

describe('ChatInterface — property tests', () => {
  // Feature: ai-voice-assistant, Property 2: Listening state drives visual indicator
  it('Property 2: isListening=true renders listening indicator', () => {
    render(<ChatInterface {...baseProps} isListening={true} />)
    expect(screen.getByTestId('listening-indicator')).toBeInTheDocument()
  })

  it('Property 2: isListening=false hides listening indicator', () => {
    render(<ChatInterface {...baseProps} isListening={false} />)
    expect(screen.queryByTestId('listening-indicator')).not.toBeInTheDocument()
  })

  // Feature: ai-voice-assistant, Property 5: Speaking state drives visual indicator
  it('Property 5: isSpeaking=true renders speaking indicator', () => {
    render(<ChatInterface {...baseProps} isSpeaking={true} />)
    expect(screen.getByTestId('speaking-indicator')).toBeInTheDocument()
  })

  it('Property 5: isSpeaking=false hides speaking indicator', () => {
    render(<ChatInterface {...baseProps} isSpeaking={false} />)
    expect(screen.queryByTestId('speaking-indicator')).not.toBeInTheDocument()
  })

  // Feature: ai-voice-assistant, Property 14: Loading indicator visible during processing
  it('Property 14: isLoading=true renders loading indicator', () => {
    render(<ChatInterface {...baseProps} isLoading={true} />)
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
  })

  it('Property 14: isLoading=false hides loading indicator', () => {
    render(<ChatInterface {...baseProps} isLoading={false} />)
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
  })

  // Feature: ai-voice-assistant, Property 12: Messages rendered in chronological order
  it('Property 12: messages render in ascending timestamp order', () => {
    fc.assert(fc.property(
      fc.uniqueArray(
        fc.record({
          id: fc.uuid(),
          role: fc.constantFrom('user' as const, 'assistant' as const),
          content: fc.string({ minLength: 1, maxLength: 20 }),
          timestamp: fc.integer({ min: 1000, max: 9999999 }),
        }),
        { selector: m => m.timestamp, minLength: 2, maxLength: 6 }
      ),
      (msgs) => {
        const { container } = render(<ChatInterface {...baseProps} messages={msgs} />)
        const bubbles = container.querySelectorAll('[data-role]')
        const renderedRoles = Array.from(bubbles).map(b => b.getAttribute('data-role'))
        const sortedRoles = [...msgs].sort((a, b) => a.timestamp - b.timestamp).map(m => m.role)
        return JSON.stringify(renderedRoles) === JSON.stringify(sortedRoles)
      }
    ))
  })
})

describe('MessageBubble — property tests', () => {
  // Feature: ai-voice-assistant, Property 13: Message bubble contains role styling and timestamp
  it('Property 13: rendered bubble has data-role and timestamp', () => {
    fc.assert(fc.property(
      fc.record({
        id: fc.uuid(),
        role: fc.constantFrom('user' as const, 'assistant' as const),
        content: fc.string({ minLength: 1, maxLength: 50 }),
        timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
      }),
      (msg: Message) => {
        const { container } = render(<MessageBubble message={msg} />)
        const bubble = container.querySelector('[data-role]')
        if (!bubble) return false
        const hasRole = bubble.getAttribute('data-role') === msg.role
        const hasTimestamp = container.textContent?.includes(':') ?? false
        return hasRole && hasTimestamp
      }
    ))
  })
})
