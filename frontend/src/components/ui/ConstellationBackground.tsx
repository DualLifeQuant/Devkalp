import { useEffect, useRef, useState } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  ox: number // original x
  oy: number // original y
  oz: number // original z
}

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 }) // current x, y and target x, y

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Generate random 3D points in a sphere/cube space
    const pointsCount = 80
    const points: Point3D[] = []
    const range = 500

    for (let i = 0; i < pointsCount; i++) {
      const x = (Math.random() - 0.5) * range
      const y = (Math.random() - 0.5) * range
      const z = (Math.random() - 0.5) * range
      points.push({ x, y, z, ox: x, oy: y, oz: z })
    }

    // Handles resizing
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    // Handles mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX - width / 2) * 0.15
      mouseRef.current.ty = (e.clientY - height / 2) * 0.15
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // Rotation angles
    let angleY = 0.001
    let angleX = 0.0006

    // Perspective projection helper
    const fov = 400

    // Animation Loop
    const tick = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse follow (easing)
      const mouse = mouseRef.current
      mouse.x += (mouse.tx - mouse.x) * 0.08
      mouse.y += (mouse.ty - mouse.y) * 0.08

      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      const projectedPoints: { x: number; y: number; z: number }[] = []

      // 3D rotation and projection
      for (let i = 0; i < pointsCount; i++) {
        const p = points[i]

        // Rotate around Y axis
        let x1 = p.ox * cosY - p.oz * sinY
        let z1 = p.ox * sinY + p.oz * cosY

        // Rotate around X axis
        let y1 = p.oy * cosX - z1 * sinX
        let z2 = p.oy * sinX + z1 * cosX

        // Store back rotated original coords for continuous rotation
        p.ox = x1
        p.oy = y1
        p.oz = z2

        // Apply mouse interaction offset (depth parallax)
        const rx = x1 + mouse.x * (z2 / 500 + 0.3)
        const ry = y1 + mouse.y * (z2 / 500 + 0.3)
        const rz = z2 + 200 // push into screen depth

        // 3D to 2D projection
        const scale = fov / (fov + rz)
        const sx = rx * scale + width / 2
        const sy = ry * scale + height / 2

        projectedPoints.push({ x: sx, y: sy, z: rz })
      }

      // Draw lines between nearby points
      const maxDistance = 140
      ctx.lineWidth = 0.6

      for (let i = 0; i < pointsCount; i++) {
        const p1 = projectedPoints[i]

        for (let j = i + 1; j < pointsCount; j++) {
          const p2 = projectedPoints[j]

          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDistance) {
            // Lines are more transparent if they are further away or deeper in Z space
            const alpha = (1 - dist / maxDistance) * 0.15
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw point dots
      for (let i = 0; i < pointsCount; i++) {
        const p = projectedPoints[i]
        // Saffron/White points with glowing aura
        const size = Math.max(1, (fov / (fov + p.z)) * 2.5)
        const alpha = Math.max(0.1, 1 - p.z / 600)
        
        ctx.fillStyle = i % 8 === 0 ? `rgba(251, 191, 36, ${alpha * 0.8})` : `rgba(255, 255, 255, ${alpha * 0.6})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40 mix-blend-screen"
    />
  )
}
