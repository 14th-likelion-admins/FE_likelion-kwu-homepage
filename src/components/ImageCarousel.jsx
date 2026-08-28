import { useRef, useState } from 'react'

const EDGE_ZONE_RATIO = 0.25
const SWIPE_THRESHOLD = 40

/**
 * 프로젝트 상세 모달 상단에 쓰이는 다중 이미지 캐러셀.
 * - 이미지가 1장이면 화살표/인디케이터 없이 그대로 표시
 * - 데스크톱: 마우스가 좌/우 가장자리 근처로 가면 화살표가 나타남
 * - 모바일: 화살표를 항상 표시하고, 스와이프로도 넘길 수 있음
 */
export default function ImageCarousel({ images, alt }) {
  const list = Array.isArray(images) ? images.filter(Boolean) : []
  const [index, setIndex] = useState(0)
  const [hoverSide, setHoverSide] = useState(null)
  const containerRef = useRef(null)
  const touchStartXRef = useRef(0)
  const touchDeltaRef = useRef(0)

  if (list.length === 0) return null

  const hasMultiple = list.length > 1
  const canPrev = index > 0
  const canNext = index < list.length - 1
  const safeIndex = Math.min(index, list.length - 1)

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))
  const goNext = () => setIndex((i) => Math.min(list.length - 1, i + 1))

  const handleMouseMove = (e) => {
    if (!hasMultiple || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width
    if (relativeX < EDGE_ZONE_RATIO) {
      setHoverSide('left')
    } else if (relativeX > 1 - EDGE_ZONE_RATIO) {
      setHoverSide('right')
    } else {
      setHoverSide(null)
    }
  }

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
    touchDeltaRef.current = 0
  }

  const handleTouchMove = (e) => {
    touchDeltaRef.current = e.touches[0].clientX - touchStartXRef.current
  }

  const handleTouchEnd = () => {
    const delta = touchDeltaRef.current
    if (delta > SWIPE_THRESHOLD) goPrev()
    else if (delta < -SWIPE_THRESHOLD) goNext()
    touchDeltaRef.current = 0
  }

  return (
    <div
      ref={containerRef}
      className='relative w-full select-none'
      style={{ lineHeight: 0, aspectRatio: '16 / 9', overflow: 'hidden', backgroundColor: '#111315' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverSide(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={list[safeIndex]}
        alt={alt}
        loading='lazy'
        decoding='async'
        className='h-full w-full'
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'top',
        }}
      />

      {hasMultiple && (
        <>
          {canPrev && (
            <button
              type='button'
              onClick={goPrev}
              aria-label='이전 사진'
              className={`absolute top-1/2 left-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-150 ${
                hoverSide === 'left' ? 'md:opacity-100' : 'md:opacity-0 md:pointer-events-none'
              }`}
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M15 18L9 12L15 6'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          )}

          {canNext && (
            <button
              type='button'
              onClick={goNext}
              aria-label='다음 사진'
              className={`absolute top-1/2 right-3 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-opacity duration-150 ${
                hoverSide === 'right' ? 'md:opacity-100' : 'md:opacity-0 md:pointer-events-none'
              }`}
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
                <path
                  d='M9 18L15 12L9 6'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          )}

          <div className='absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5'>
            {list.map((_, i) => (
              <span
                key={i}
                className='h-1.5 w-1.5 rounded-full'
                style={{ backgroundColor: i === safeIndex ? '#fff' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
