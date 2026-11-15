import { useEffect, useRef } from 'react'

// Scrolling PQRST trace that beats at the live heart rate
export default function EcgTrace({ bpm, color = '#5eead4' }) {
  const ref = useRef(null)
  const rate = useRef(bpm)
  rate.current = bpm

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame
    let last = performance.now()
    let phase = 0
    const points = []

    const beatShape = (p) => {
      if (p < 0.08) return Math.sin((p / 0.08) * Math.PI) * 0.12 // P
      if (p > 0.14 && p < 0.16) return -0.15 // Q
      if (p >= 0.16 && p < 0.2) return 1 // R
      if (p >= 0.2 && p < 0.23) return -0.3 // S
      if (p > 0.32 && p < 0.48) return Math.sin(((p - 0.32) / 0.16) * Math.PI) * 0.25 // T
      return 0
    }

    const draw = (now) => {
      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width * devicePixelRatio) {
        canvas.width = rect.width * devicePixelRatio
        canvas.height = rect.height * devicePixelRatio
      }
      const w = canvas.width
      const h = canvas.height
      const dt = (now - last) / 1000
      last = now
      phase = (phase + dt * (rate.current / 60)) % 1
      points.push(beatShape(phase))
      while (points.length > w / (2 * devicePixelRatio)) points.shift()

      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = color
      ctx.lineWidth = 2 * devicePixelRatio
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.beginPath()
      points.forEach((p, i) => ctx.lineTo(i * 2 * devicePixelRatio, h * 0.62 - p * h * 0.5))
      ctx.stroke()
      if (!still) frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [color])

  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" />
}
