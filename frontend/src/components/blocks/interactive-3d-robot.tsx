import { Suspense, lazy } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface InteractiveRobotSplineProps {
  scene: string
  style?: React.CSSProperties
}

export function InteractiveRobotSpline({ scene, style }: InteractiveRobotSplineProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      <Suspense
        fallback={
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0a0a0a', color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
          }}>
            Loading 3D scene…
          </div>
        }
      >
        <Spline
          scene={scene}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Suspense>
      {/* Cover Spline watermark — matches app background */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 250, height: 70,
        background: '#0a0a0a',
        zIndex: 99,
        pointerEvents: 'none',
      }} />
    </div>
  )
}
