import React from 'react'

interface Props {
  isListening: boolean
  isLoading: boolean
  isSpeaking: boolean
}

export default function StatusBar({ isListening, isLoading, isSpeaking }: Props) {
  let label = 'Idle'
  let cls = ''
  if (isListening) { label = 'Listening…'; cls = 'listening' }
  else if (isLoading) { label = 'Thinking…'; cls = 'loading' }
  else if (isSpeaking) { label = 'Speaking…'; cls = 'speaking' }

  return (
    <div className={`status-bar ${cls}`} aria-live="polite" data-testid="status-bar">
      {label}
    </div>
  )
}
