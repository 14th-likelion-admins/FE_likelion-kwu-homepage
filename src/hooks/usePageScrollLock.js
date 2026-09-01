import { useEffect } from 'react'
import { smoothScrollTo } from '../utils/smoothScroll'

/**
 * 모달이 떠 있는 동안 뒤 페이지가 스크롤되지 않게 잠근다. 잠글 때의 스크롤 위치를 기억해
 * 풀 때 그대로 되돌린다.
 *
 * 모달을 열 때만 마운트한다면 인자 없이 부르면 되고, 늘 마운트해 두고 isOpen으로 여닫는
 * 모달이라면 그 값을 넘긴다. 조기 return보다 먼저 불러야 훅 순서가 지켜진다.
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
 *
 * @param {boolean} [locked] false면 아무것도 잠그지 않는다. 기본값은 true.
 */
export function usePageScrollLock(locked = true) {
  useEffect(() => {
    if (!locked) return undefined

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
      // body를 고정한 동안 문서 스크롤은 0으로 밀려 있었고, Lenis도 그 0을 자기 위치로
      // 기억한다. 그래서 window.scrollTo로만 되돌리면 Lenis가 다음 프레임에 도로 0으로
      // 끌어내리는 경우가 있다. 헬퍼를 거치면 Lenis 내부 위치까지 같이 맞춰진다.
      smoothScrollTo(scrollY, { immediate: true, force: true })
    }
  }, [locked])
}
