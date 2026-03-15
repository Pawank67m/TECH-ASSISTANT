export type CommandResult =
  | { type: 'open_url'; url: string; message: string }
  | { type: 'open_app'; app: string; message: string }
  | { type: 'search'; query: string; message: string }
  | { type: 'time'; message: string }
  | { type: 'date'; message: string }
  | { type: 'weather'; city: string; message: string }
  | { type: 'none' }

// Apps we can open via the backend
const KNOWN_APPS: Record<string, string> = {
  chrome: 'chrome',
  firefox: 'firefox',
  notepad: 'notepad',
  calculator: 'calculator',
  calc: 'calculator',
  paint: 'paint',
  explorer: 'explorer',
  'file explorer': 'explorer',
  word: 'word',
  excel: 'excel',
  powerpoint: 'powerpoint',
  vlc: 'vlc',
  spotify: 'spotify',
  vscode: 'vscode',
  'vs code': 'vscode',
  terminal: 'terminal',
  cmd: 'terminal',
  'task manager': 'task_manager',
  camera: 'camera',
}

export function handle(transcript: string): CommandResult {
  const t = transcript.trim().toLowerCase()

  // Open desktop app
  const openMatch = t.match(/\bopen\s+(.+)/)
  if (openMatch) {
    const appName = openMatch[1].trim()

    // Check known desktop apps first
    for (const [key, val] of Object.entries(KNOWN_APPS)) {
      if (appName.includes(key)) {
        return { type: 'open_app', app: val, message: `Opening ${key}.` }
      }
    }

    // Known websites — open in browser tab
    const WEBSITES: Array<[string[], string, string]> = [
      [['youtube'],                   'https://www.youtube.com',        'Opening YouTube.'],
      [['google'],                    'https://www.google.com',         'Opening Google.'],
      [['github'],                    'https://www.github.com',         'Opening GitHub.'],
      [['twitter', ' x.com'],         'https://www.x.com',              'Opening X.'],
      [['instagram'],                 'https://www.instagram.com',      'Opening Instagram.'],
      [['whatsapp'],                  'https://web.whatsapp.com',       'Opening WhatsApp.'],
      [['facebook'],                  'https://www.facebook.com',       'Opening Facebook.'],
      [['netflix'],                   'https://www.netflix.com',        'Opening Netflix.'],
      [['gmail'],                     'https://mail.google.com',        'Opening Gmail.'],
      [['maps', 'google maps'],       'https://maps.google.com',        'Opening Google Maps.'],
      [['drive', 'google drive'],     'https://drive.google.com',       'Opening Google Drive.'],
      [['docs', 'google docs'],       'https://docs.google.com',        'Opening Google Docs.'],
      [['reddit'],                    'https://www.reddit.com',         'Opening Reddit.'],
      [['linkedin'],                  'https://www.linkedin.com',       'Opening LinkedIn.'],
      [['amazon'],                    'https://www.amazon.com',         'Opening Amazon.'],
      [['flipkart'],                  'https://www.flipkart.com',       'Opening Flipkart.'],
      [['stackoverflow', 'stack overflow'], 'https://stackoverflow.com','Opening Stack Overflow.'],
      [['chatgpt', 'chat gpt'],       'https://chat.openai.com',        'Opening ChatGPT.'],
      [['twitch'],                    'https://www.twitch.tv',          'Opening Twitch.'],
      [['discord'],                   'https://discord.com/app',        'Opening Discord.'],
      [['telegram'],                  'https://web.telegram.org',       'Opening Telegram.'],
      [['zoom'],                      'https://zoom.us',                'Opening Zoom.'],
      [['notion'],                    'https://www.notion.so',          'Opening Notion.'],
      [['figma'],                     'https://www.figma.com',          'Opening Figma.'],
    ]

    for (const [keywords, url, message] of WEBSITES) {
      if (keywords.some(k => appName.includes(k))) {
        return { type: 'open_url', url, message }
      }
    }
  }

  const searchMatch = t.match(/\bsearch\s+(.+)/)
  if (searchMatch) {
    const query = searchMatch[1].trim()
    return { type: 'search', query, message: `Searching Google for "${query}".` }
  }

  if (/what time is it|what is the time|current time/.test(t)) {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    return { type: 'time', message: `The current time is ${h}:${minutes} ${ampm}.` }
  }

  if (/what is the date|today's date|current date/.test(t)) {
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    return { type: 'date', message: `Today is ${dateStr}.` }
  }

  const weatherMatch = t.match(/weather\s+(?:in|of)\s+(.+)/)
  if (weatherMatch) {
    const city = weatherMatch[1].trim()
    return { type: 'weather', city, message: `Fetching weather for ${city}.` }
  }

  return { type: 'none' }
}
