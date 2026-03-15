import React, { useRef, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  onMicClick: () => void
  isListening: boolean
  disabled?: boolean
  placeholder?: string
}

// Shared hue counter so all glow elements animate in sync
const sharedHue = { value: 0 }

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hueOffset?: number
  pulsing?: boolean
  children: React.ReactNode
}

function GlowButton({ hueOffset = 0, pulsing = false, children, disabled, style, ...rest }: GlowButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!canvas || !ctx) return
      const size = canvas.width
      ctx.clearRect(0, 0, size, size)
      const hue = (sharedHue.value + hueOffset) % 360
      const hue2 = (hue + 60) % 360

      // Outer glow ring
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue}, 100%, 65%, ${pulsing ? 1 : 0.9})`
      ctx.lineWidth = pulsing ? 3.5 : 2.5
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.9)`
      ctx.shadowBlur = pulsing ? 22 : 14
      ctx.stroke()
      ctx.restore()

      // Inner bright ring
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue2}, 100%, 88%, 0.5)`
      ctx.lineWidth = 1
      ctx.shadowColor = `hsla(${hue2}, 100%, 80%, 0.8)`
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.restore()

      // Travelling spark around the circle
      const angle = ((sharedHue.value * 0.06) % 1) * Math.PI * 2
      const r = size / 2 - 2
      const sx = size / 2 + Math.cos(angle) * r
      const sy = size / 2 + Math.sin(angle) * r
      ctx.save()
      ctx.beginPath()
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue2}, 100%, 95%, 1)`
      ctx.shadowColor = `hsla(${hue2}, 100%, 80%, 1)`
      ctx.shadowBlur = 14
      ctx.fill()
      ctx.restore()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [hueOffset, pulsing])

  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        position: 'relative',
        width: 50,
        height: 50,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(30, 20, 50, 0.92)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        zIndex: 2,
        opacity: disabled ? 0.45 : 1,
        transition: 'transform 0.1s, opacity 0.2s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        width={50}
        height={50}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '50%' }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </span>
    </button>
  )
}

export function AnimatedGlowingSearchBar({
  value, onChange, onSubmit, onMicClick, isListening, disabled,
  placeholder = 'Message TECH INNOV...'
}: SearchBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let t = 0

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function drawLightning() {
      if (!canvas || !ctx) return
      const w = canvas.width
      const h = canvas.height
      const r = h / 2

      ctx.clearRect(0, 0, w, h)

      const hue = (t * 0.8) % 360
      const hue2 = (hue + 60) % 360

      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0,    `hsla(${hue}, 100%, 65%, 0.0)`)
      grad.addColorStop(0.25, `hsla(${hue}, 100%, 65%, 0.9)`)
      grad.addColorStop(0.5,  `hsla(${hue2}, 100%, 70%, 1.0)`)
      grad.addColorStop(0.75, `hsla(${hue}, 100%, 65%, 0.9)`)
      grad.addColorStop(1,    `hsla(${hue}, 100%, 65%, 0.0)`)

      function pillPath(inset: number) {
        if (!ctx || !canvas) return
        const ri = Math.max(r - inset, 4)
        ctx.beginPath()
        ctx.moveTo(ri + inset, inset)
        ctx.lineTo(w - ri - inset, inset)
        ctx.arcTo(w - inset, inset, w - inset, ri + inset, ri)
        ctx.lineTo(w - inset, h - ri - inset)
        ctx.arcTo(w - inset, h - inset, w - ri - inset, h - inset, ri)
        ctx.lineTo(ri + inset, h - inset)
        ctx.arcTo(inset, h - inset, inset, h - ri - inset, ri)
        ctx.lineTo(inset, ri + inset)
        ctx.arcTo(inset, inset, ri + inset, inset, ri)
        ctx.closePath()
      }

      // Thick outer glow
      ctx.save()
      pillPath(0)
      ctx.strokeStyle = grad
      ctx.lineWidth = 6
      ctx.shadowColor = `hsla(${hue}, 100%, 65%, 0.8)`
      ctx.shadowBlur = 18
      ctx.stroke()
      ctx.restore()

      // Thin bright inner line
      ctx.save()
      pillPath(1)
      ctx.strokeStyle = `hsla(${hue2}, 100%, 85%, 0.95)`
      ctx.lineWidth = 1.5
      ctx.shadowColor = `hsla(${hue2}, 100%, 80%, 1)`
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.restore()

      // Travelling sparks
      const perimeter = 2 * (w - h) + Math.PI * h
      const straight = w - h
      const arc = (Math.PI * h) / 2
      const seg1 = straight / perimeter
      const seg2 = seg1 + arc / perimeter
      const seg3 = seg2 + straight / perimeter
      const seg4 = seg3 + arc / perimeter

      function sparkPos(pos: number): [number, number] {
        if (pos < seg1) {
          return [r + (pos / seg1) * straight, 0]
        } else if (pos < seg2) {
          const a = ((pos - seg1) / (seg2 - seg1)) * (Math.PI / 2) - Math.PI / 2
          return [w - r + Math.cos(a) * r, r + Math.sin(a) * r]
        } else if (pos < seg3) {
          return [w, r + ((pos - seg2) / (seg3 - seg2)) * straight]
        } else if (pos < seg4) {
          const a = ((pos - seg3) / (seg4 - seg3)) * (Math.PI / 2)
          return [w - r + Math.cos(a) * r, h - r + Math.sin(a) * r]
        } else {
          return [w - r - ((pos - seg4) / (1 - seg4)) * (w - h), h]
        }
      }

      const [sx, sy] = sparkPos(((t * 2.2) % perimeter) / perimeter)
      ctx.save()
      ctx.beginPath()
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${hue2}, 100%, 95%, 1)`
      ctx.shadowColor = `hsla(${hue2}, 100%, 80%, 1)`
      ctx.shadowBlur = 20
      ctx.fill()
      ctx.restore()

      const [sx2, sy2] = sparkPos(((t * 2.2 + perimeter / 2) % perimeter) / perimeter)
      ctx.save()
      ctx.beginPath()
      ctx.arc(sx2, sy2, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${(hue + 120) % 360}, 100%, 90%, 0.9)`
      ctx.shadowColor = `hsla(${(hue + 120) % 360}, 100%, 75%, 1)`
      ctx.shadowBlur = 16
      ctx.fill()
      ctx.restore()

      t += 0.6
      sharedHue.value = t
      animRef.current = requestAnimationFrame(drawLightning)
    }

    drawLightning()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
      {/* Canvas lightning border on input */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'calc(100% - 28px - 116px)',
          height: '52px',
          pointerEvents: 'none',
          zIndex: 1,
          borderRadius: '26px',
        }}
      />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Type a message"
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.06)',
          color: '#ececec',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '26px',
          padding: '14px 20px',
          fontSize: '15px',
          outline: 'none',
          fontFamily: 'inherit',
          position: 'relative',
          zIndex: 2,
        }}
      />

      {/* Send button */}
      <GlowButton
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        aria-label="Send message"
        hueOffset={0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </GlowButton>

      {/* Mic button */}
      <GlowButton
        onClick={onMicClick}
        disabled={disabled}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
        aria-pressed={isListening}
        hueOffset={120}
        pulsing={isListening}
      >
        {isListening && <span className="mic-ping" />}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18" aria-hidden="true">
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A8.001 8.001 0 0 0 20 11a1 1 0 0 0-2 0 6 6 0 0 1-12 0 1 1 0 0 0-2 0 8.001 8.001 0 0 0 7 7.93z"/>
        </svg>
      </GlowButton>
    </div>
  )
}
