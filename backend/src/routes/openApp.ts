import { Router, Request, Response } from 'express'
import { exec } from 'child_process'

const router = Router()

// Map of app names to Windows shell commands
const APP_COMMANDS: Record<string, string> = {
  chrome:      'start chrome',
  firefox:     'start firefox',
  notepad:     'start notepad',
  calculator:  'start calc',
  paint:       'start mspaint',
  explorer:    'start explorer',
  word:        'start winword',
  excel:       'start excel',
  powerpoint:  'start powerpnt',
  vlc:         'start vlc',
  spotify:     'start spotify',
  vscode:      'start code',
  terminal:    'start cmd',
  task_manager:'start taskmgr',
  camera:      'start microsoft.windows.camera:',
}

router.post('/', (req: Request, res: Response) => {
  const { app } = req.body as { app?: string }
  if (!app) {
    res.status(400).json({ error: 'Missing app name' })
    return
  }

  const key = app.toLowerCase().replace(/\s+/g, '_')
  const command = APP_COMMANDS[key]

  if (!command) {
    res.status(404).json({ error: `Unknown app: ${app}` })
    return
  }

  exec(command, (err) => {
    if (err) {
      console.error(`Failed to open ${app}:`, err.message)
      res.status(500).json({ error: `Could not open ${app}` })
      return
    }
    res.json({ success: true, message: `Opening ${app}` })
  })
})

export default router
