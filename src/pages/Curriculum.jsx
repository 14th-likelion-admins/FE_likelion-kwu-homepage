import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import recruitNoise from '../assets/recruit/noise-texture-recruit-tile.webp'
import { curriculumData, trackTabs } from '../data/curriculumData'
import { loadFonts } from '../utils/fonts'

export default function Curriculum() {
  const { track } = useParams()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const itemRefs = useRef([])

  const safeTrack = useMemo(() => (curriculumData[track] ? track : 'frontend'), [track])
  const current = curriculumData[safeTrack]

  useEffect(() => {
    loadFonts()
  }, [])

  useEffect(() => {
    const elements = itemRefs.current.filter(Boolean)
    if (!elements.length) return undefined

    let rafId = null
    const updateActiveStep = () => {
      const scrollBottom = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const isAtPageBottom = scrollBottom >= documentHeight - 2
      if (isAtPageBottom) {
        const lastIndex = elements.length - 1
        setActiveStep((prev) => (prev === lastIndex ? prev : lastIndex))
        return
      }

      const viewportCenter = window.innerHeight * 0.45
      let next = 0
      let minDistance = Number.POSITIVE_INFINITY

      elements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect()
        const elementCenter = rect.top + rect.height / 2
        const distance = Math.abs(elementCenter - viewportCenter)
        if (distance < minDistance) {
          minDistance = distance
          next = idx
        }
      })

      setActiveStep((prev) => (prev === next ? prev : next))
    }

    const onScrollOrResize = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        updateActiveStep()
        rafId = null
      })
    }

    updateActiveStep()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
    }
  }, [safeTrack, current.items.length])

  return (
    <div
      className='relative min-h-screen overflow-x-hidden text-white'
      style={{ backgroundColor: '#111315', fontFamily: 'Space Grotesk' }}
    >
      <div
        className='pointer-events-none absolute inset-0 z-[1] opacity-[0.75]'
        style={{
          backgroundImage: `url(${recruitNoise})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '512px 512px',
          backgroundPosition: 'top center',
        }}
      />

      <Header />

      <main className='relative z-10 mx-auto max-w-[1200px] px-5 pb-24 pt-28 md:px-8 md:pt-36'>
        <button
          type='button'
          className='mb-10 text-2xl text-white/90 transition hover:text-white'
          onClick={() => navigate('/recruit')}
          aria-label='recruit로 돌아가기'
        >
          ‹
        </button>

        <p className='text-center text-lg font-medium md:text-3xl'>광운대 멋쟁이사자처럼 14기 커리큘럼을 소개합니다</p>

        <div className='mt-10 flex w-full flex-nowrap items-center justify-center gap-2 md:mt-14 md:gap-6'>
          {trackTabs.map((tab) => {
            const active = tab.key === safeTrack
            return (
              <Link
                key={tab.key}
                to={`/curriculum/${tab.key}`}
                className={`inline-flex h-9 w-[31%] max-w-[132px] items-center justify-center rounded-full border px-2 text-sm font-medium
                  md:h-14 md:w-[180px] md:max-w-[180px] md:min-w-0 md:px-5 md:text-xl ${
                  active ? 'border-white bg-white text-[#111]' : 'border-white/70 bg-transparent text-white'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        <section className='relative mt-16 md:mt-24'>
          <h2 className='text-1xl font-semibold md:text-3xl'>{current.heading}</h2>

          <div className='absolute right-0 top-[34%] w-[16%] opacity-80 md:right-[-12%] md:top-[22%] md:w-[52%] md:translate-x-[60px]'>
            <img
              src={current.logo}
              alt=''
              width={current.logoWidth}
              height={current.logoHeight}
              loading='eager'
              fetchPriority='high'
              decoding='async'
              className='w-full object-contain'
            />
          </div>

          <div className='mt-10 space-y-12 md:mt-14 md:space-y-16'>
            {current.items.map((item, idx) => {
              const active = idx === activeStep
              const number = String(idx + 1).padStart(2, '0')
              return (
                <article
                  key={`${safeTrack}-${idx}`}
                  ref={(el) => {
                    itemRefs.current[idx] = el
                  }}
                  data-step-index={idx}
                  className='relative grid grid-cols-[40px_1fr] gap-x-4 md:grid-cols-[56px_1fr] md:gap-x-6'
                >
                  <div className='relative flex justify-center'>
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold md:h-14 md:w-14 md:text-xl ${
                        active
                          ? 'border-orange-300 bg-white text-orange-500 shadow-[0_0_20px_rgba(255,153,102,0.65)]'
                          : 'border-white/80 bg-transparent text-white'
                      }`}
                    >
                      {number}
                    </span>
                    {idx < current.items.length - 1 && (
                      <span className='absolute left-1/2 top-12 h-[78px] w-px -translate-x-1/2 bg-white/55 md:top-16 md:h-[92px]' />
                    )}
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold md:text-2xl'>{item.title}</h3>
                    <p className='mt-3 text-sm leading-relaxed text-white/90 md:mt-4 md:text-xl'>{item.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <div className='relative z-20 w-full px-4 pb-3'>
        <Footer />
      </div>
    </div>
  )
}
