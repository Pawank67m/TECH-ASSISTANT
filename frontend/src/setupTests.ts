import '@testing-library/jest-dom'

// jsdom doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () {}

// jsdom doesn't implement SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string
  rate = 1.0
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}
;(window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance
