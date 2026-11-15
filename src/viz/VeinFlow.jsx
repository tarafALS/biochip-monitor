import { useEffect, useRef } from 'react'

// Animated cross-section of the internal jugular vein.
// Blood cells travel at a speed proportional to the measured velocity (cm/s);
// the vessel widens with the measured cross-sectional area (mm²).
export default function VeinFlow({ flow, area, color }) {
  const ref = useRef(null)
  const live = useRef({ flow, area, color })
  live.current = { flow, area, color }

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame
    let width = 0
    let height = 0
    let cells = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      cells = Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        lane: Math.random() * 2 - 1,
        size: 3 + Math.random() * 2.5,
        tilt: Math.random() * Math.PI,
      }))
    }

    // The vessel gently curves like a neck vein
    const centerY = (x) => height / 2 + Math.sin(x / width * Math.PI * 1.5) * height * 0.08

    const draw = () => {
      const { flow: v, area: a, color: c } = live.current
      const radius = Math.min(height * 0.42, 14 + Math.sqrt(Math.max(a, 1)) * 3.6)
      ctx.clearRect(0, 0, width, height)

      // vessel wall glow
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'rgba(251, 92, 116, 0.10)'
      ctx.lineWidth = radius * 2 + 18
      ctx.beginPath()
      for (let x = -20; x <= width + 20; x += 8) ctx.lineTo(x, centerY(x))
      ctx.stroke()
      ctx.strokeStyle = 'rgba(120, 20, 40, 0.55)'
      ctx.lineWidth = radius * 2
      ctx.stroke()
      ctx.strokeStyle = c
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 1.5
      for (const side of [-1, 1]) {
        ctx.beginPath()
        for (let x = -20; x <= width + 20; x += 8) ctx.lineTo(x, centerY(x) + side * radius)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // blood cells: centre lanes move faster (laminar profile)
      const pxPerFrame = v * 0.32 // negative velocity = reverse flow
      for (const cell of cells) {
        const profile = 1 - cell.lane * cell.lane * 0.7
        if (!still) {
          cell.x += pxPerFrame * profile + (Math.random() - 0.5) * 0.4
          cell.tilt += 0.02
          if (cell.x > width + 10) cell.x = -10
          if (cell.x < -10) cell.x = width + 10
        }
        const y = centerY(cell.x) + cell.lane * (radius - 6)
        ctx.save()
        ctx.translate(cell.x, y)
        ctx.rotate(cell.tilt)
        ctx.fillStyle = v < 5 ? '#b3263f' : '#fb5c74'
        ctx.beginPath()
        ctx.ellipse(0, 0, cell.size * 1.4, cell.size, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(80, 0, 20, 0.45)'
        ctx.beginPath()
        ctx.ellipse(0, 0, cell.size * 0.6, cell.size * 0.4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (!still) frame = requestAnimationFrame(draw)
    }

    resize()
    draw()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />
}
