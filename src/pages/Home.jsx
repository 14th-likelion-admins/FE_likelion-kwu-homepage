// src/pages/Home.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Core1 from '../assets/corevalue1.webp'
import Core2 from '../assets/corevalue2.webp'
import Core3 from '../assets/corevalue3.webp'
import mainsun from '../assets/mainsun.webp'
import noiseBg from '../assets/noise-bg-tile.webp'
import noiseStar from '../assets/noise-star.webp'
import gradiantBg from '../assets/gradiant-bg.webp'
import supportButton from '../assets/support-button.webp'

import { LINKS } from '../utils/links'
import { loadFonts } from '../utils/fonts'

export default function Home() {
  const navigate = useNavigate()
  const [aboutVisible, setAboutVisible] = useState(false)
  const [coreValuesVisible, setCoreValuesVisible] = useState(false)
  const [heroAnimated, setHeroAnimated] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [heroHover, setHeroHover] = useState(null)

  const aboutRef = useRef(null)
  const coreValuesRef = useRef(null)

  const handleApplyClick = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
    window.open(LINKS.FORMLINK)
  }

  const handleViewClick = () => {
    navigate('/activities')
  }

  useEffect(() => {
    loadFonts()
    // Hero 애니메이션 시작
    const timer = setTimeout(() => {
      setHeroAnimated(true)
    }, 100)

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px',
    }

    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setAboutVisible(true)
        } else {
          setAboutVisible(false)
        }
      })
    }, observerOptions)

    const coreValuesObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCoreValuesVisible(true)
        } else {
          setCoreValuesVisible(false)
        }
      })
    }, observerOptions)

    if (aboutRef.current) aboutObserver.observe(aboutRef.current)
    if (coreValuesRef.current) coreValuesObserver.observe(coreValuesRef.current)

    return () => {
      clearTimeout(timer)
      if (aboutRef.current) aboutObserver.unobserve(aboutRef.current)
      if (coreValuesRef.current) coreValuesObserver.unobserve(coreValuesRef.current)
    }
  }, [])

  return (
    <div
      className='overflow-x-hidden text-white'
      style={{
        backgroundColor: '#1A1A1A',
        fontFamily: 'Space Grotesk',
      }}
    >
      <Header />

      {/* 지원 Toast 알림 */}
      {showToast && (
        <div
          className='fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-3 md:px-6 md:py-4 bg-gray-800 text-white rounded-lg shadow-2xl border border-gray-600'
          style={{
            animation: 'slideDown 0.3s ease-out',
            maxWidth: '90vw',
            minWidth: '280px',
          }}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translate(-50%, -20px);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0);
              }
            }
          `}</style>
          <p className='text-sm leading-relaxed text-center md:text-base'>{LINKS.MESSAGE}</p>
        </div>
      )}

      <main className='relative min-h-screen'>
        {/* Noise 배경 - 모든 섹션에 적용 */}
        <div
          className='absolute inset-0 pointer-events-none z-[5]'
          style={{
            backgroundImage: `url(${noiseBg})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '512px 512px',
            opacity: 0.5,
          }}
        ></div>

        {/* Hero Section - 중앙 3D 구체 */}
        <section className='relative flex items-center justify-center h-screen overflow-hidden'>
          {/* 배경 */}
          <div className='absolute inset-0' style={{ backgroundColor: '#1A1A1A' }}></div>

          {/* Noise Star 배경 - Hero 섹션 전용 */}
          <div
            className='absolute inset-0 pointer-events-none z-[1]'
            style={{
              backgroundImage: `url(${noiseStar})`,
              backgroundRepeat: 'repeat',
              opacity: 0.6,
            }}
          ></div>

          {/* 중앙 구체와 모든 텍스트 */}
          <div className='relative z-10 flex items-center justify-center w-full'>
            {/* 전체 컨테이너 */}
            <div
              className='relative flex items-center justify-center'
              style={{ width: '1000px', height: '600px' }}
            >
              {/* 중앙 구체 이미지 */}
              <div
                className='absolute'
                style={{
                  width: '552.5px',
                  height: '552.5px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  src={mainsun}
                  alt='Main Sun'
                  width='913'
                  height='913'
                  loading='eager'
                  fetchPriority='high'
                  decoding='async'
                  className='object-cover w-full h-full'
                />
              </div>

              {/* FRONTEND - 버튼 */}
              <button
                className='absolute z-20'
                onClick={() => navigate('/curriculum/frontend')}
                onMouseEnter={() => setHeroHover('frontend')}
                onMouseLeave={() => setHeroHover(null)}
                onFocus={() => setHeroHover('frontend')}
                onBlur={() => setHeroHover(null)}
                style={{
                  top: '100px',
                  left: heroAnimated ? '38%' : '50%',
                  transform: 'translate(-50%, 0)',
                  opacity: heroAnimated ? 1 : 0,
                  transition: 'left 1.5s, opacity 1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div
                  className={`text-2xl md:text-3xl font-light tracking-wide transition-[color,font-weight,filter] duration-300 ${
                    heroHover === 'frontend'
                      ? 'font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'
                      : 'text-white'
                  }`}
                >
                  FRONTEND
                </div>
              </button>

              {/* BACKEND - 버튼 */}
              <button
                className='absolute z-20'
                onClick={() => navigate('/curriculum/backend')}
                onMouseEnter={() => setHeroHover('backend')}
                onMouseLeave={() => setHeroHover(null)}
                onFocus={() => setHeroHover('backend')}
                onBlur={() => setHeroHover(null)}
                style={{
                  top: '180px',
                  left: heroAnimated ? '30%' : '50%',
                  transform: 'translate(-50%, 0)',
                  opacity: heroAnimated ? 1 : 0,
                  transition: 'left 1.5s, opacity 1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div
                  className={`text-2xl md:text-3xl font-light tracking-wide transition-[color,font-weight,filter] duration-300 ${
                    heroHover === 'backend'
                      ? 'font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'
                      : 'text-white'
                  }`}
                >
                  BACKEND
                </div>
              </button>

              {/* LIKE LION - 텍스트 */}
              <div
                className='absolute text-left transition-all'
                style={{
                  top: '40%',
                  left: heroAnimated ? '80px' : '50%',
                  transform: heroAnimated ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                  opacity: heroAnimated ? 1 : 0,
                  transitionDuration: '1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div className='hidden text-4xl font-light leading-tight tracking-wide md:block'>
                  LIKE
                </div>
                <div className='hidden text-4xl font-light leading-tight tracking-wide md:block'>
                  LION
                </div>
              </div>

              {/* Exploding X - 텍스트 */}
              <div
                className='absolute text-center transition-all'
                style={{
                  top: '40%',
                  left: heroAnimated ? '68%' : '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: heroAnimated ? 1 : 0,
                  transitionDuration: '1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div className='hidden text-4xl font-light tracking-wider text-white lg:inline-block'>
                  Exploding X
                </div>
              </div>

              {/* KWAG WOON UNIV - 텍스트 */}
              <div
                className='absolute text-right'
                style={{
                  top: '40%',
                  left: heroAnimated ? 'auto' : '50%',
                  right: heroAnimated ? '80px' : 'auto',
                  transform: heroAnimated ? 'translateY(-50%)' : 'translate(-50%, -50%)',
                  opacity: heroAnimated ? 1 : 0,
                  transition: 'left 1.5s, right 1.5s, transform 1.5s, opacity 1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div className='text-3xl font-light leading-tight tracking-wide md:text-4xl'>
                  KWANG
                </div>
                <div className='text-3xl font-light leading-tight tracking-wide md:text-4xl'>
                  WOON
                </div>
                <div className='text-3xl font-light leading-tight tracking-wide md:text-4xl'>
                  UNIV
                </div>
              </div>

              {/* UXUI DESIGN - 버튼 */}
              <button
                className='absolute z-20'
                onClick={() => navigate('/curriculum/design')}
                onMouseEnter={() => setHeroHover('design')}
                onMouseLeave={() => setHeroHover(null)}
                onFocus={() => setHeroHover('design')}
                onBlur={() => setHeroHover(null)}
                style={{
                  bottom: '250px',
                  left: heroAnimated ? '38%' : '50%',
                  transform: 'translate(-50%, 0)',
                  opacity: heroAnimated ? 1 : 0,
                  transition: 'left 1.5s, opacity 1.5s',
                  transitionDelay: '0s',
                }}
              >
                <div
                  className={`text-2xl md:text-3xl font-light tracking-wide transition-[color,font-weight,filter] duration-300 ${
                    heroHover === 'design'
                      ? 'font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'
                      : 'text-white'
                  }`}
                >
                  UXUI DESIGN
                </div>
              </button>
            </div>
          </div>

          {/* 우측 하단 버튼 영역 */}
          <div className='absolute z-20 flex items-center gap-4 right-12 bottom-12'>
            {/* 지원 하기 버튼 - 이미지 */}
            <button
              onClick={handleApplyClick}
              className='z-30 transition-opacity hover:opacity-80'
              type='button'
            >
              <img src={supportButton} alt='지원 하기' width='283' height='71' loading='lazy' decoding='async' className='w-auto h-12' />
            </button>
          </div>
        </section>

        {/* ABOUT Section */}
        <section
          ref={aboutRef}
          className='relative px-4 py-20'
          style={{ backgroundColor: '#1A1A1A' }}
          id='about'
        >
          <div className='max-w-6xl mx-auto'>
            {/* ABOUT 큰 타이틀 - 왼쪽에서 등장, 왼쪽 치우침 */}
            <div className='pl-8 mb-16 overflow-hidden text-left md:pl-16'>
              <h2
                className={`text-6xl md:text-8xl lg:text-9xl text-white transition-all duration-1000 ${
                  aboutVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
                }`}
              >
                ABOUT
              </h2>
            </div>

            {/* 통계 - 가운데 고정 */}
            <div className='flex flex-wrap justify-center gap-16 mb-20 md:gap-24'>
              <div className='text-center drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'>
                <div className='mb-2 text-5xl font-bold text-white md:text-6xl '>13</div>
                <div className='text-sm text-gray-300'>시작한지</div>
              </div>
              <div className='text-center drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'>
                <div className='mb-2 text-5xl font-bold text-white md:text-6xl'>11,947</div>
                <div className='text-sm text-gray-300'>멋사 대학 출신 학생 수</div>
              </div>
              <div className='text-center drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'>
                <div className='mb-2 text-5xl font-bold text-white md:text-6xl'>1,634</div>
                <div className='text-sm text-gray-300'>해커톤 최다 참여 인원</div>
              </div>
              <div className='text-center drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]'>
                <div className='mb-2 text-5xl font-bold text-white md:text-6xl'>97</div>
                <div className='text-sm text-gray-300'>누적 참여 대학</div>
              </div>
            </div>

            {/* LIKELION 타이틀 - 오른쪽에서 등장, 오른쪽 치우침 */}
            <div className='pr-8 mb-12 overflow-hidden text-right md:pr-16'>
              <h3
                className={`text-6xl md:text-8xl lg:text-9xl tracking-wider transition-all duration-1000 ${
                  aboutVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
              >
                LIKELION
              </h3>
            </div>

            {/* View more 버튼 - 아래에서 등장 */}
            <div className='flex justify-center'>
              <button
                onClick={handleViewClick}
                className={`px-8 py-3 border border-gray-400 rounded-full text-sm transition-all duration-1000 ${
                  aboutVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                View more
              </button>
            </div>
          </div>
        </section>

        {/* CORE VALUES Section */}
        <section
          ref={coreValuesRef}
          className='relative px-4 py-32 overflow-visible'
          style={{ backgroundColor: '#1A1A1A' }}
        >
          {/* Gradiant 배경 이미지 */}
          <div
            className='absolute pointer-events-none z-[1]'
            style={{
              backgroundImage: `url(${gradiantBg})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '60%',
              opacity: 0.6,
              top: '-20%',
              left: '-10%',
              right: '-10%',
              bottom: '-20%',
            }}
          ></div>

          <div className='relative z-10 max-w-5xl mx-auto'>
            {/* 타이틀 */}
            <div className='mb-20 text-center'>
              <h3 className='mb-2 text-2xl font-normal tracking-wider text-white md:text-3xl'>
                CORE VALUES
              </h3>
            </div>

            <div className='grid gap-12 md:grid-cols-3 md:gap-16'>
              {/* Responsibility 이미지 */}
              <div
                className={`transition-all duration-700 flex flex-col items-center ${
                  coreValuesVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: '0ms' }}
              >
                <img src={Core1} alt='Responsibility' width='320' height='509' loading='lazy' decoding='async' className='w-48 h-auto mb-6 md:w-56' />
              </div>

              {/* Curiosity 이미지 */}
              <div
                className={`transition-all duration-700 flex flex-col items-center ${
                  coreValuesVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <img src={Core2} alt='Curiosity' width='320' height='513' loading='lazy' decoding='async' className='w-48 h-auto mb-6 md:w-56' />
              </div>

              {/* Cooperation 이미지 */}
              <div
                className={`transition-all duration-700 flex flex-col items-center ${
                  coreValuesVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <img src={Core3} alt='Cooperation' width='320' height='509' loading='lazy' decoding='async' className='w-48 h-auto mb-6 md:w-56' />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Be the LION */}
        <section className='relative px-4 py-32' style={{ backgroundColor: '#1A1A1A' }}>
          {/* Noise Star 배경 - CTA 섹션 전용 */}
          <div
            className='absolute inset-0 pointer-events-none z-[1]'
            style={{
              backgroundImage: `url(${noiseStar})`,
              backgroundRepeat: 'repeat',
              opacity: 0.6,
            }}
          ></div>

          <div className='max-w-5xl mx-auto relative z-10 min-h-[400px] flex flex-col'>
            {/* 좌측 상단 꺾쇠 */}
            <div className='absolute top-0 left-0'>
              <div className='text-6xl font-bold text-white md:text-7xl'>⌜</div>
            </div>

            {/* 중앙 텍스트 */}
            <div className='flex items-center flex-1'>
              <div className='pt-8 pl-8 space-y-6 text-left'>
                <h2 className='text-5xl font-bold leading-tight md:text-7xl'>
                  Be the LION,
                  <br />
                  Rule Your World!
                </h2>
                <p className='text-lg font-bold'>: 멋사랑 어흥해</p>
              </div>
            </div>

            {/* 우측 하단 꺾쇠 */}
            <div className='absolute right-0 bottom-20'>
              <div className='text-6xl font-bold text-white md:text-7xl'>⌟</div>
            </div>

            {/* 버튼 */}
            <div className='relative z-20 pb-8 text-center'>
              <button
                type='button'
                onClick={handleApplyClick}
                className='transition-opacity hover:opacity-80'
              >
                <img src={supportButton} alt='지원 하기' width='283' height='71' loading='lazy' decoding='async' className='w-auto h-12 mx-auto' />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
