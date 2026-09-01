import { useEffect } from 'react'

/**
 * 모달이 떠 있는 동안 뒤 페이지가 스크롤되지 않게 잠근다. 모달이 마운트될 때 걸고,
 * 언마운트될 때 원래 위치로 되돌린다.
 *
 * 이것만으로는 모달 안이 스크롤되지 않는다. 이 사이트는 Lenis로 부드러운 스크롤을
 * 쓰는데, Lenis는 window에 붙은 wheel을 가로채 preventDefault한 뒤 페이지를 대신
 * 움직인다. 그래서 모달 위에서 굴려도 브라우저 기본 스크롤이 일어나지 않고 뒤 배경만
 * 흘러갔다. 스크롤시킬 패널에 data-lenis-prevent를 함께 달아야 Lenis가 그 안에서 난
 * 이벤트를 아예 건드리지 않아 기본 스크롤이 살아난다. (끝에 닿았을 때 바깥으로 번지는
 * 것은 overscroll-contain으로 막는다.)
 *
 * overflow: hidden만으로 멈추지 않는 브라우저가 있어 position: fixed까지 쓰고,
 * top에 지금 스크롤 위치를 음수로 넣어 화면이 맨 위로 튀지 않게 한다.
 */
export function usePageScrollLock() {
  useEffect(() => {
    const scrollY = window.scrollY
    const { style } = document.body
    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'

    return () => {
      style.removeProperty('overflow')
      style.removeProperty('position')
      style.removeProperty('top')
      style.removeProperty('width')
      // 즉시 이동이라 Lenis가 있어도 그대로 동작한다. behavior: 'smooth'를 주면 무시된다.
      window.scrollTo(0, scrollY)
    }
  }, [])
}
