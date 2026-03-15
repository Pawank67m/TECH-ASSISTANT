import React, { useEffect, useRef, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from './types'
import ChatInterface from './components/ChatInterface'
import { InteractiveRobotSpline } from './components/blocks/interactive-3d-robot'
import { AnimatedGlowingSearchBar } from './components/ui/animated-glowing-search-bar'
import { SpeechRecognizer } from './services/speechRecognizer'
import { speak } from './services/speechSynthesizer'
import { handle } from './services/commandHandler'
import { sendMessage, getWeather, openApp } from './services/apiClient'
import { initSession, saveMessage, loadHistory } from './services/conversationStore'

const ROBOT_SCENE_URL = 'https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode'

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const sessionIdRef = useRef<string>('')
  const recognizerRef = useRef<SpeechRecognizer | null>(null)
  const messagesRef = useRef<Message[]>([])

  // Keep messagesRef in sync so callbacks always have latest messages
  useEffect(() => { messagesRef.current = messages }, [messages])

  function stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  function sayText(text: string) {
    // Cancel any ongoing speech first
    if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(true)
    speak(text, () => setIsSpeaking(false))
  }

  function addMessage(role: 'user' | 'assistant', content: string): Message {
    const msg: Message = { id: uuidv4(), role, content, timestamp: Date.now() }
    setMessages(prev => [...prev, msg])
    setShowChat(true)
    saveMessage(sessionIdRef.current, msg)
    return msg
  }

  // Use ref so recognizer callback always calls the latest version
  const processInputRef = useRef<((transcript: string) => Promise<void>) | null>(null)

  async function processInput(transcript: string) {
    if (!transcript.trim()) return
    addMessage('user', transcript)
    const result = handle(transcript)

    // open_url and search must call window.open synchronously here
    // (before any await) to avoid browser popup blocking
    if (result.type === 'open_url') {
      window.open(result.url, '_blank')
      addMessage('assistant', result.message)
      sayText(result.message)
      return
    }
    if (result.type === 'search') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(result.query)}`, '_blank')
      addMessage('assistant', result.message)
      sayText(result.message)
      return
    }
    if (result.type === 'open_app') {
      addMessage('assistant', `Opening ${result.app}...`)
      try {
        const msg = await openApp(result.app)
        sayText(msg)
      } catch (err: any) {
        const errMsg = err.message ?? `Could not open ${result.app}.`
        addMessage('assistant', errMsg)
        sayText(errMsg)
      }
      return
    }
    if (result.type === 'time' || result.type === 'date') {
      addMessage('assistant', result.message)
      sayText(result.message)
      return
    }
    if (result.type === 'weather') {
      setIsLoading(true)
      try {
        const weather = await getWeather(result.city)
        addMessage('assistant', weather)
        sayText(weather)
      } catch (err: any) {
        const msg = err.message ?? 'Could not fetch weather.'
        addMessage('assistant', msg)
        sayText(msg)
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    try {
      const response = await sendMessage(transcript, messagesRef.current)
      addMessage('assistant', response)
      sayText(response)
    } catch (err: any) {
      addMessage('assistant', err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Keep ref updated every render
  processInputRef.current = processInput

  useEffect(() => {
    const id = initSession()
    sessionIdRef.current = id
    loadHistory(id).then(history => {
      if (history.length > 0) {
        setMessages(history)
        setShowChat(true)
      }
    })

    const recognizer = new SpeechRecognizer()
    // Use ref so this always calls the latest processInput
    recognizer.onResult = (transcript) => {
      setIsListening(false)
      processInputRef.current?.(transcript)
    }
    recognizer.onError = (msg) => {
      setIsListening(false)
      addMessage('assistant', msg)
      setShowChat(true)
    }
    recognizerRef.current = recognizer

    return () => {
      stopSpeech()
      recognizer.stop()
    }
  }, [])

  function submitInput() {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    processInput(text)
  }

  function handleMicToggle() {
    const recognizer = recognizerRef.current
    if (!recognizer) return
    if (isListening) {
      recognizer.stop()
      setIsListening(false)
    } else {
      stopSpeech()
      if (!recognizer.isSupported()) {
        addMessage('assistant', 'Voice input is not supported in this browser.')
        return
      }
      recognizer.start()
      setIsListening(true)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>
      {/* 3D Robot background */}
      <InteractiveRobotSpline
        scene={ROBOT_SCENE_URL}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      {/* Title — top center, only when chat is hidden */}
      {!showChat && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', paddingTop: '32px',
          pointerEvents: 'none',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            fontWeight: 900,
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            letterSpacing: '0.12em',
            background: 'linear-gradient(90deg, #a855f7, #06b6d4, #a855f7, #f0abfc, #06b6d4)',
            backgroundSize: '300% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'titleShimmer 3s linear infinite',
            filter: 'drop-shadow(0 0 18px rgba(168,85,247,0.7))',
          }}>
            TECH INNOV
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem',
            marginTop: '8px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            animation: 'fadeInOut 3s ease-in-out infinite',
          }}>
            Type or speak to start
          </p>
        </div>
      )}

      {/* Messages panel */}
      {showChat && (
        <div style={{
          position: 'absolute', bottom: '130px', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '760px', zIndex: 20,
          height: 'calc(50vh - 130px)',
          background: 'rgba(15,15,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px 16px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Back button */}
          <button
            onClick={() => { stopSpeech(); setShowChat(false) }}
            aria-label="Close chat"
            style={{
              position: 'absolute', top: '10px', right: '12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%',
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              zIndex: 5, flexShrink: 0,
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'
              ;(e.currentTarget as HTMLElement).style.color = 'white'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
              <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/>
            </svg>
          </button>

          <ChatInterface
            messages={messages}
            isListening={isListening}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            onSendText={processInput}
            onMicToggle={handleMicToggle}
          />
        </div>
      )}

      {/* Input bar */}
      <div style={{
        position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '760px', zIndex: 30,
        background: 'rgba(10,10,10,0.75)',
        backdropFilter: 'blur(24px)',
        borderRadius: '32px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <AnimatedGlowingSearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={submitInput}
          onMicClick={handleMicToggle}
          isListening={isListening}
          disabled={isLoading || isSpeaking}
        />
      </div>
    </div>
  )
}
