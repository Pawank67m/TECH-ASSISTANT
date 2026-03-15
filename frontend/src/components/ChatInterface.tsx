import React, { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'
import StatusBar from './StatusBar'

interface Props {
  messages: Message[]
  isListening: boolean
  isLoading: boolean
  isSpeaking: boolean
  onSendText: (text: string) => void
  onMicToggle: () => void
}

export default function ChatInterface({
  messages, isListening, isLoading, isSpeaking,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="chat-layout" style={{ background: 'transparent' }}>
      <div className="message-list" role="log" aria-label="Conversation" aria-live="polite">
        {sorted.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Type or speak to chat with the assistant</p>
          </div>
        )}

        {sorted.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {isLoading && (
          <div className="loading-dots" data-testid="loading-indicator" aria-label="Thinking">
            <span /><span /><span />
          </div>
        )}

        {isListening && (
          <div className="indicator listening" data-testid="listening-indicator">
            <span className="dot-pulse" />
            Listening…
          </div>
        )}

        {isSpeaking && (
          <div className="indicator speaking" data-testid="speaking-indicator">
            <span className="dot-pulse" />
            Speaking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <StatusBar isListening={isListening} isLoading={isLoading} isSpeaking={isSpeaking} />
    </div>
  )
}
