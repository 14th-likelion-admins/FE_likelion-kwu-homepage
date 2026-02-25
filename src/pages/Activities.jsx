import { useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import noiseTexture from '../assets/activities/Noise & Texture.png'
import dottedCircle from '../assets/activities/Rectangle.png'
import cardOt from '../assets/activities/활동소개아이콘1.png'
import cardProject from '../assets/activities/활동소개아이콘2.png'
import cardHackathon from '../assets/activities/활통소개아이콘3.png'
import cardIdeathon from '../assets/activities/활동소개아이콘4.png'
import { loadFonts } from '../utils/fonts'

const activityCards = [
  {
    id: 'ot',
    title: 'OT',
    description: '멋쟁이 사자처럼으로\n향하는 첫 걸음!',
    image: cardOt,
  },
  {
    id: 'ideathon',
    title: '아이디어톤',
    description: '5월, 특정 주제에 맞춰,\n톡톡 튀는 아이디어로\n승부합니다!',
    image: cardIdeathon,
  },
  {
    id: 'hackathon',
    title: '해커톤',
    description: '8월, 멋쟁이사자처럼이\n자부하는 역대급 규모의\n무박 2일 해커톤 행사',
    image: cardHackathon,
  },
  {
    id: 'project',
    title: '프로젝트',
    description: '기획부터 구현까지\n협업 과정을 배우는\n중요 활동',
    image: cardProject,
  },
]

export default function Activities() {
  useEffect(() => {
    loadFonts()
  }, [])

  return (
    <div
      className='relative flex min-h-screen flex-col overflow-x-hidden text-white'
      style={{ backgroundColor: '#111315', fontFamily: 'Space Grotesk' }}
    >
      <div
        className='pointer-events-none absolute inset-0 z-[1] opacity-[0.82]'
        style={{
          backgroundImage: `url(${noiseTexture})`,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '1740px auto',
          backgroundPosition: 'top center',
        }}
      />

      <Header />

      <main className='relative z-10 flex-1 overflow-x-hidden px-4 pb-8 pt-28 md:px-6 md:pt-36'>
        <section className='relative mx-auto max-w-[1360px] overflow-x-hidden'>
          <img
            src={dottedCircle}
            alt=''
            className='pointer-events-none absolute left-1/2 top-[54%] w-[860px] max-w-[72vw] -translate-x-1/2 -translate-y-1/2 opacity-85'
          />

          <h1 className='text-center text-[14px] font-semibold tracking-tight md:text-[20px]'>
            광운대 멋쟁이사자처럼 활동을 소개합니다
          </h1>

          <div className='mt-10 grid grid-cols-1 gap-[30px] sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-0.5'>
            {activityCards.map((card) => (
              <article
                key={card.id}
                className='relative mx-auto flex h-[136px] w-full max-w-[268px] flex-row items-center gap-4 rounded-[16px] border border-white/85 bg-white/[0.22] px-5 py-4 sm:h-[500px] sm:flex-col sm:items-center sm:rounded-[30px] sm:px-6 sm:pb-8 sm:pt-10 lg:h-[420px] lg:max-w-[276px]'
              >
                <div className='flex h-[82px] w-[82px] shrink-0 items-center justify-center sm:h-[220px] sm:w-full'>
                  <img
                    src={card.image}
                    alt=''
                    className='w-full object-contain sm:w-[85%]'
                  />
                </div>
                <div className='flex-1 sm:mt-auto sm:w-full sm:flex-none'>
                  <h2 className='text-left text-[18px] font-normal leading-[1.1] sm:flex sm:h-[76px] sm:items-end sm:justify-center sm:text-center sm:text-[26px] sm:font-semibold lg:text-[24px]'>
                    {card.title}
                  </h2>
                  <p className='mt-2 whitespace-pre-line text-left text-[12px] font-normal leading-[1.28] text-white/95 sm:mt-4 sm:min-h-[116px] sm:text-center sm:text-[16px] sm:font-medium sm:leading-[1.28] lg:text-[14px]'>
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className='relative z-20 w-full px-4 pb-3'>
        <Footer />
      </div>
    </div>
  )
}
