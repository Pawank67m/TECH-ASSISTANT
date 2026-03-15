type SpeechRecognitionType = typeof window extends { SpeechRecognition: infer T } ? T : any

export class SpeechRecognizer {
  private recognition: SpeechRecognitionType | null = null
  isListening = false

  onResult: (transcript: string) => void = () => {}
  onError: (message: string) => void = () => {}

  private get SpeechRecognitionClass() {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  }

  isSupported(): boolean {
    return !!this.SpeechRecognitionClass
  }

  start(): void {
    if (!this.isSupported()) {
      this.onError('Voice input is not supported in this browser.')
      return
    }
    if (this.isListening) return

    const SR = this.SpeechRecognitionClass
    this.recognition = new SR()
    this.recognition.continuous = false
    this.recognition.interimResults = false
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      this.onResult(transcript)
    }

    this.recognition.onerror = (event: any) => {
      const errorMap: Record<string, string> = {
        'not-allowed': 'Microphone permission denied. Please allow microphone access.',
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error during speech recognition.',
      }
      this.onError(errorMap[event.error] ?? `Speech recognition error: ${event.error}`)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    this.recognition.start()
    this.isListening = true
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
    this.isListening = false
  }
}
