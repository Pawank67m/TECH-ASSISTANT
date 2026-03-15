import React from 'react'

interface Props {
  isListening: boolean
  onClick: () => void
  disabled?: boolean
}

export default function MicButton({ isListening, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
      aria-pressed={isListening}
      className={`icon-btn mic-btn ${isListening ? 'listening' : ''}`}
    >
      {isListening && <span className="mic-ping" />}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
        <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A8.001 8.001 0 0 0 20 11a1 1 0 0 0-2 0 6 6 0 0 1-12 0 1 1 0 0 0-2 0 8.001 8.001 0 0 0 7 7.93z"/>
      </svg>
    </button>
  )
}
