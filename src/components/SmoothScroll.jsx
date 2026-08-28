import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reducedMotion.matches) return undefined

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    })

    let animationFrameId
    const animate = (time) => {
      lenis.raf(time)
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      lenis.destroy()
    }
  }, [])

  return null
}
