import { useEffect } from 'react'
import Lenis from 'lenis'
import { setActiveLenis } from '../utils/smoothScroll'

/**
 * 부드러운 스크롤을 켜는 컴포넌트. 화면에는 아무것도 그리지 않는다.
 *
 * 프로그램적으로 스크롤해야 할 때는 여기가 아니라 utils/smoothScroll의
 * smoothScrollTo를 쓴다. 이유는 그 파일 주석 참고.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (reducedMotion.matches) return undefined

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
    })
    setActiveLenis(lenis)

    let animationFrameId
    const animate = (time) => {
      lenis.raf(time)
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      lenis.destroy()
      setActiveLenis(null)
    }
  }, [])

  return null
}
