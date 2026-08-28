import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import recruitNoise from '../assets/recruit/noise-texture-recruit-tile.webp'
import leftHalf from '../assets/recruit/left_half.png'
import fullCircle from '../assets/recruit/full_circle.png'
import halfCircleLine from '../assets/recruit/half_circle_line.png'
import supportButton from '../assets/recruit/support-button.png'
import recruitMainText from '../assets/recruit/recruit_main_txt.png'
import designBox from '../assets/recruit/design.png'
import frontendBox from '../assets/recruit/frontend.png'
import backendBox from '../assets/recruit/backend.png'
import passionCard from '../assets/recruit/열정.png'
import coworkCard from '../assets/recruit/협업.png'
import responseCard from '../assets/recruit/책임.png'
import scheduleImage from '../assets/recruit/schedule.png'
import { loadFonts } from '../utils/fonts'

const DESIGN_WIDTH = 1728
const DESIGN_HEIGHT = 3200

const partCards = [
  { id: 'design', image: designBox, href: '/curriculum/design' },
  { id: 'frontend', image: frontendBox, href: '/curriculum/frontend' },
  { id: 'backend', image: backendBox, href: '/curriculum/backend' },
]

const targetCards = [
  { id: 'passion', image: passionCard },
  { id: 'cowork', image: coworkCard },
  { id: 'response', image: responseCard },
]

const scheduleItems = [
  { date: '2.19~3.6', label: '서류모집' },
  { date: '3.7', label: '서류 합격자 발표' },
  { date: '3.9~3.10', label: '면접 진행' },
  { date: '3.11', label: '최종 합격자 발표' },
  { date: '3.12', label: 'OT' },
]

const heroKeywords = ['INSPIRE', 'NETWORK', 'INNOVATE', 'PASSION', 'JOURNEY']

export default function Recruit() {
  const [scale, setScale] = useState(1)
  const sceneHeight = DESIGN_HEIGHT * scale + 121

  useEffect(() => {
    loadFonts()

    const updateScale = () => {
      const width = window.innerWidth
      const baseScale = width / DESIGN_WIDTH

      let boost = 1
      if (width < 480) boost = 1.62
      else if (width < 768) boost = 1.48
      else if (width < 1024) boost = 1.24

      const next = Math.min(baseScale * boost, 1)
      setScale(next)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  return (
    <div className='relative min-h-screen overflow-x-hidden text-white' style={{ backgroundColor: '#1A1A1A', fontFamily: 'Space Grotesk' }}>
      <div
        className='pointer-events-none absolute inset-0 z-[1] opacity-[0.82]'
        style={{
          backgroundImage: `url(${recruitNoise})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '512px 512px',
          backgroundPosition: 'top center',
        }}
      />

      <Header />

      <a
        href='https://forms.gle/EG1SGUQ7PGxvHkvh9'
        target='_blank'
        rel='noreferrer noopener'
        className='fixed bottom-8 right-6 z-50 hidden transition-opacity hover:opacity-85 md:bottom-12 md:right-10 md:block'
      >
        <img src={supportButton} alt='지원 하기' className='h-11 w-auto md:h-14' />
      </a>

      <div className='relative z-10 w-full pt-[121px]' style={{ height: `${sceneHeight}px` }}>
        <div
          className='absolute left-1/2 top-[121px]'
          style={{
            width: `${DESIGN_WIDTH}px`,
            height: `${DESIGN_HEIGHT}px`,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <img
            src={fullCircle}
            alt=''
            className='pointer-events-none absolute -right-[285px] top-[171px] z-[1] w-[564px] max-w-none opacity-95'
          />

          <img
            src={halfCircleLine}
            alt=''
            className='pointer-events-none absolute left-1/2 top-[595px] z-[1] w-[1940px] max-w-none -translate-x-1/2 opacity-[0.84]'
          />
          <img
            src={leftHalf}
            alt=''
            className='pointer-events-none absolute -left-[200px] top-[1775px] z-[1] w-[716px] max-w-none opacity-[0.9]'
          />

          <section id='about' className='relative z-10 px-6 pt-[225px]'>
          <img
            src={recruitMainText}
            alt='BE THE LION, CODE YOUR FUTURE AND RULE YOUR WORLD'
            className='mx-auto w-full max-w-[760px] object-contain md:max-w-[1062px]'
          />
            <div className='mt-[60px] flex flex-wrap justify-center gap-3'>
              {heroKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className='inline-flex h-12 min-w-[130px] items-center justify-center rounded-full border border-white/70 px-6 text-[13px] font-normal tracking-wide'
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          <section id='parts' className='relative z-10 px-6 pt-[565px]'>
            <h2 className='text-center text-[38px] font-medium'>모집 파트</h2>
            <div className='mx-auto mt-12 grid max-w-[1080px] grid-cols-1 gap-6 md:grid-cols-3'>
              {partCards.map((part) => (
                <a
                  key={part.id}
                  href={part.href}
                  className='group relative mx-auto block w-full max-w-[660px] overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5'
                >
                  <img src={part.image} alt='' className='block h-auto w-full object-contain' />
                </a>
              ))}
            </div>
          </section>

          <section id='target' className='relative z-10 px-6 pt-[405px]'>
            <h2 className='text-center text-[38px] font-medium'>모집 대상</h2>
            <div className='mx-auto mt-12 grid max-w-[1280px] grid-cols-1 gap-5 md:grid-cols-3'>
              {targetCards.map((item) => (
                <img key={item.id} src={item.image} alt='' className='mx-auto h-auto w-full max-w-[660px] object-contain' />
              ))}
            </div>
          </section>

          <section id='schedule' className='relative z-10 px-6 pb-40 pt-[150px] md:pt-[545px]'>
            <h2 className='text-center text-[38px] font-medium'>모집 일정</h2>
            <div className='mx-auto mt-10 max-w-[1320px]'>
              <img src={scheduleImage} alt='모집 일정 라인' className='translate-x-[10px] w-full object-contain' />
              <div className='mx-auto mt-7 grid max-w-[1080px] grid-cols-5 gap-x-3 gap-y-10 text-center md:max-w-[1120px] md:gap-x-4'>
                {scheduleItems.map((item) => (
                  <div key={item.date} className='space-y-1'>
                    <p className='text-[16px] font-normal'>{item.date}</p>
                    <p className='text-[20px] font-medium leading-tight'>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className='relative z-20 hidden w-full px-4 pb-3 md:block'>
        <Footer />
      </div>
    </div>
  )
}
