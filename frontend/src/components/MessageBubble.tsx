import React from 'react'
import type { Message } from '../types'

interface Props { message: Message }

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message }: Props) {
  return (
    <div className={`message-row ${message.role}`} data-role={message.role}>
      <div className={`bubble ${message.role}`}>
        {message.content}
        <span className="bubble-time" aria-label={`Sent at ${formatTime(message.timestamp)}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
