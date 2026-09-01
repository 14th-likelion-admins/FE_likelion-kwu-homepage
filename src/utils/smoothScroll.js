/**
 * 프로그램적으로 페이지를 스크롤할 때 쓰는 헬퍼.
 *
 * 이 사이트는 Lenis로 부드러운 스크롤을 구현하는데, Lenis는 매 프레임 스크롤 위치를
 * 직접 써 넣는다. 그래서 브라우저 기본 부드러운 스크롤
 * (scrollIntoView({ behavior: 'smooth' }), window.scrollTo({ behavior: 'smooth' }))은
 * 시작하자마자 다음 프레임에 취소되어 **아무 일도 일어나지 않는다.** 에러도 안 난다.
 * 실제로 /projects의 UP 버튼과 ?id= 딥링크가 이것 때문에 둘 다 죽어 있었다.
 *
 * 그래서 스크롤은 Lenis에게 시켜야 하고, 그러려면 컴포넌트 밖에서도 인스턴스에
 * 닿을 수 있어야 해서 모듈 스코프에 둔다.
 *
 * 참고: behavior를 빼면(즉시 이동) 기본 API도 정상 동작한다. 경로가 바뀔 때 맨 위로
 * 올리는 App.jsx의 ScrollToTop이 그 경우라 손대지 않았다.
 */
let activeLenis = null

/** SmoothScroll 컴포넌트만 호출한다. 언마운트 시 null로 되돌린다. */
export function setActiveLenis(instance) {
  activeLenis = instance
}

/**
 * 페이지를 부드럽게 스크롤한다. 기본 API 대신 반드시 이 함수를 쓴다.
 *
 * @param {number|string|HTMLElement} target 위치(px), CSS 선택자, 또는 DOM 요소
 * @param {object} [options] Lenis scrollTo 옵션. 고정 헤더를 피하려면 offset에 음수를 준다
 */
export function smoothScrollTo(target, options = {}) {
  const { offset = 0, ...lenisOptions } = options
  const position = resolvePosition(target, offset)
  if (position === null) return

  if (activeLenis) {
    // Lenis는 스크롤 가능한 최대 거리를 자체 ResizeObserver로 재는데, 첫 측정이 끝나기
    // 전에는 limit이 0이라 목표 위치가 통째로 0으로 잘린다. 페이지에 들어오자마자
    // 스크롤하는 경우(?id= 딥링크)가 정확히 그 시점에 걸리므로 즉시 다시 재게 한다.
    activeLenis.resize()
    activeLenis.scrollTo(position, lenisOptions)
    return
  }

  // prefers-reduced-motion이면 Lenis를 아예 만들지 않는다. 그때는 즉시 이동한다.
  window.scrollTo(0, position)
}

/**
 * 스크롤 목표를 문서 기준 y좌표(숫자)로 바꾼다.
 *
 * Lenis의 scrollTo에 DOM 요소를 그대로 넘기면, 내부에서 숫자로 바꾸지 못했을 때
 * 아무 일도 하지 않고 조용히 반환한다. 실제로 딥링크 스크롤이 그 경로에 걸려
 * 통째로 무시됐다. 그래서 변환은 Lenis에 맡기지 않고 여기서 직접 한다.
 */
function resolvePosition(target, offset) {
  if (typeof target === 'number') return target + offset

  const element = typeof target === 'string' ? document.querySelector(target) : target
  if (!element) return null
  return element.getBoundingClientRect().top + window.scrollY + offset
}
