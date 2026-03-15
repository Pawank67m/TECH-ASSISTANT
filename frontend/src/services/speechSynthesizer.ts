// Priority list of natural-sounding voices (Siri-like)
const PREFERRED_VOICES = [
  'Samantha',        // macOS/iOS Siri voice
  'Karen',           // Australian
  'Daniel',          // UK English
  'Google US English',
  'Google UK English Female',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Sonia Online (Natural)',
]

function getBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  // Try preferred voices first
  for (const name of PREFERRED_VOICES) {
    const match = voices.find(v => v.name.includes(name))
    if (match) return match
  }

  // Fall back to any en-US or en-GB voice
  return (
    voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('espeak')) ??
    voices.find(v => v.lang.startsWith('en')) ??
    voices[0]
  )
}

export function speak(
  text: string,
  onEnd: () => void,
  _synth?: { speak: (u: SpeechSynthesisUtterance) => void }
): void {
  const synth = _synth ?? (typeof window !== 'undefined' ? window.speechSynthesis : undefined)
  if (!synth) { onEnd(); return }

  // Cancel any ongoing speech
  if (!_synth && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
  }

  function doSpeak() {
    const utterance = new SpeechSynthesisUtterance(text)

    const voice = getBestVoice()
    if (voice) utterance.voice = voice

    utterance.rate = 1.05    // slightly faster than default — feels more natural
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'

    utterance.onend = () => onEnd()
    utterance.onerror = () => onEnd()

    try {
      if (_synth) {
        _synth.speak(utterance)
      } else {
        window.speechSynthesis.speak(utterance)
      }
    } catch {
      onEnd()
    }
  }

  // Voices may not be loaded yet on first call — wait for them
  if (!_synth && window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null
      doSpeak()
    }
  } else {
    doSpeak()
  }
}
