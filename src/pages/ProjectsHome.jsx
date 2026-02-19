// src/pages/ProjectsHome.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import bkImage1 from '../assets/bk-image-1.png'
import noiseTexture from '../assets/noise-texture.png'
import { getAllProjects, getLatestProjects } from '../data/projectsData'
import ProjectDetailModal from '../components/ProjectDetailModal'

/**
 * ============================================================================
 * ProjectsHome 페이지
 * ============================================================================
 *
 * 이 페이지는 프로젝트 홈 화면으로, 다음 기능을 제공합니다:
 * - 무한 스크롤 마퀴 텍스트 ("OUR PROJECTS - EXPLORE")
 * - 최신 프로젝트 5개의 카드 슬라이더
 * - 프로젝트 카드 클릭 시 상세 모달 표시
 *
 * 디자인 기준:
 * - 피그마 디자인: 1728x1114 (데스크탑)
 * - 반응형 스케일링 적용
 * ============================================================================
 */

// 피그마 디자인 기준 크기 (데스크탑)
const DESIGN_WIDTH = 1728
const DESIGN_HEIGHT = 1114

/**
 * 무한 스크롤 마퀴 텍스트 컴포넌트
 *
 * "OUR PROJECTS - EXPLORE" 텍스트가 무한히 스크롤되는 애니메이션을 제공합니다.
 *
 * @param {number} scale - 화면 크기에 따른 스케일 비율
 */
export const ProjectsShowcaseSection = ({ scale }) => {
  const marqueeText = 'OUR PROJECTS - EXPLORE'
  const marqueeItems = [marqueeText, marqueeText, marqueeText]

  const fontSize = 220 * scale
  const lineHeight = 281 * scale
  const topPosition = 120 * scale
  const height = 293 * scale

  return (
    <section
      className='absolute left-0 w-full overflow-hidden'
      style={{
        top: `${topPosition}px`,
        height: `${height}px`,
      }}
      aria-label='Projects showcase marquee'
    >
      <div className='flex animate-marquee-slow whitespace-nowrap' style={{ width: 'max-content' }}>
        {marqueeItems.map((text, index) => (
          <span
            key={index}
            className='inline-block px-4 text-white md:px-16'
            style={{
              fontFamily: "'Space Grotesk', Helvetica, sans-serif",
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              textShadow: '0px 4px 25px rgba(229, 50, 15, 0.5)',
              fontWeight: 'normal',
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </section>
  )
}

export default function ProjectsHome() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartXRef = useRef(0)
  const dragMovedRef = useRef(false)

  // 화면 크기에 따라 스케일 계산 (데스크탑/노트북만)
  useEffect(() => {
    const calculateLayout = () => {
      const windowWidth = window.innerWidth
      const height = window.innerHeight
      const baseWidth = 1728
      const baseHeight = 1114
      const widthRatio = windowWidth / baseWidth
      const heightRatio = height / baseHeight
      // 높이 기준으로 스케일하되, 최소 너비는 유지
      const newScale = Math.min(widthRatio, heightRatio * 0.9)
      setScale(newScale)
    }

    calculateLayout()
    window.addEventListener('resize', calculateLayout)
    return () => window.removeEventListener('resize', calculateLayout)
  }, [])

  // ============================================================================
  // 최신 프로젝트 데이터 로드
  // ============================================================================
  // getLatestProjects(5)를 사용하여 숫자가 가장 큰 프로젝트 5개를 가져옵니다.
  // 각 프로젝트의 썸네일 이미지를 사용하며, 썸네일이 없으면 메인 이미지를 사용합니다.
  // 전체 프로젝트 데이터를 한 번만 가져와서 재사용합니다.
  // ============================================================================
  const allProjects = getAllProjects()
  const latestProjects = getLatestProjects(5)
  const projects = latestProjects.map((project) => ({
    id: project.id,
    image: project.thumbnail || project.image, // 썸네일 이미지 우선 사용, 없으면 메인 이미지 fallback
    title: project.title,
    desc: project.description,
  }))

  // ============================================================================
  // 슬라이더 네비게이션 함수
  // ============================================================================

  /**
   * 다음 프로젝트 카드로 이동
   *
   * 동작 조건:
   * - 5번 카드가 초기 1번 카드 자리에 올 때까지 이동 가능
   * - 화면에 3개 카드가 보이므로, 5번 카드가 1번 자리에 오려면 4번 카드까지 사라져야 함
   * - 즉, currentIndex가 3이 되면 4번 카드가 사라지고 5번 카드가 1번 자리에 옴
   * - 이 시점에서 > 버튼이 비활성화됨
   */
  const handleNext = () => {
    if (currentIndex < projects.length - 2) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  /**
   * 이전 프로젝트 카드로 이동
   *
   * 동작 조건:
   * - currentIndex가 0보다 클 때만 이동 가능
   * - currentIndex가 0이면 < 버튼이 비활성화됨
   */
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const cardWidth = 545 * scale
  const cardHeight = 364 * scale
  const cardGap = 48 * scale
  const firstCardLeft = `${(437 + 200 + 100) * scale}px`
  const firstCardTop = (120 + 293 + 60 - 200 + 120) * scale
  const worksLeftValue = (73 + 30 + 50 + 30 + 20 + 20) * scale
  const worksLeft = `${worksLeftValue}px`
  const worksTop = (626 - 50 - 8) * scale
  const worksTextLeftValue = worksLeftValue + 5 * scale
  const buttonSize = 100 * scale
  const leftButtonLeftValue = worksLeftValue
  const leftButtonLeft = `${leftButtonLeftValue}px`
  const leftButtonTop = (710 - 50) * scale
  const buttonGap = 20 * scale
  const rightButtonLeftValue = leftButtonLeftValue + buttonSize + buttonGap
  const rightButtonLeft = `${rightButtonLeftValue}px`
  const rightButtonTop = (710 - 50) * scale
  const moreButtonLeftValue = leftButtonLeftValue
  const moreButtonLeft = `${moreButtonLeftValue}px`
  const moreButtonTop = (838 - 50) * scale

  const handleDragStart = (clientX) => {
    dragStartXRef.current = clientX
    dragMovedRef.current = false
    setIsDragging(true)
  }

  const handleDragMove = (clientX) => {
    if (!isDragging) return
    const delta = clientX - dragStartXRef.current
    if (Math.abs(delta) > 8) {
      dragMovedRef.current = true
    }
    setDragOffset(delta)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    const delta = dragOffset
    const threshold = (cardWidth + cardGap) * 0.2

    if (delta > threshold && currentIndex > 0) {
      handlePrev()
    } else if (delta < -threshold && currentIndex < projects.length - 2) {
      handleNext()
    }

    setDragOffset(0)
    setIsDragging(false)
    // 드래그 후 발생할 수 있는 클릭 방지
    setTimeout(() => {
      dragMovedRef.current = false
    }, 0)
  }

  const onPointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    handleDragStart(clientX)
  }

  const onPointerMove = (e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    handleDragMove(clientX)
  }

  const onPointerUp = () => {
    handleDragEnd()
  }

  // 데스크탑 레이아웃만
  return (
    <div
      className='bg-[#1A1A1A] text-white font-sans relative'
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'Space Grotesk',
      }}
    >
      <Header />

      <main className='relative h-full pt-20' style={{ height: 'calc(100vh - 80px)' }}>
        {/* 배경 이미지 */}
        <div
          className='fixed bg-center bg-no-repeat'
          style={{
            backgroundImage: `url(${bkImage1})`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center bottom',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            minHeight: '400px',
            zIndex: 0,
          }}
        />

        {/* 배경 노이즈 텍스처 */}
        <div
          className='fixed opacity-30 mix-blend-overlay'
          style={{
            backgroundImage: `url(${noiseTexture})`,
            backgroundRepeat: 'repeat',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />

        <div className='relative z-10' style={{ minHeight: 'calc(100vh - 80px)' }}>
          {/* 무한 마퀴 텍스트 */}
          <ProjectsShowcaseSection scale={scale} />

          {/* 컨텐츠 영역 - 화면 전체 너비 사용 */}
          <div
            className='relative w-full'
            style={{
              minHeight: 'calc(100vh - 400px)',
              paddingTop: `${(190 + 293 + 92) * scale}px`,
            }}
          >
            <div
              className='relative w-full'
              style={{
                paddingLeft: 'max(1rem, calc((100vw - 1280px) / 2))',
                paddingRight: 'max(1rem, calc((100vw - 1280px) / 2))',
              }}
            >
              {/* Works 텍스트 */}
              <h3
                className='absolute font-bold text-white'
                style={{
                  fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                  fontSize: `${60 * scale}px`,
                  lineHeight: `${76 * scale}px`,
                  left: `${worksTextLeftValue}px`, // Works 텍스트만 우측으로 5px 추가 이동
                  top: `${(626 - 190 - 293 - 92 - 8) * scale}px`, // 상단으로 8px 추가 이동
                  width: `${180 * scale}px`,
                  height: `${76 * scale}px`,
                }}
              >
                Works
              </h3>

              {/* 좌측 화살표 버튼 */}
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className='absolute flex items-center justify-center transition-opacity border rounded-full disabled:opacity-50 active:opacity-70 focus:outline-none'
                onMouseDown={(e) => {
                  e.currentTarget.style.opacity = '0.7'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.opacity = ''
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = ''
                }}
                style={{
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  left: `${leftButtonLeftValue}px`,
                  top: `${(710 - 190 - 293 - 92) * scale}px`,
                  background: '#1A1A1A',
                  borderColor: '#D9D9D9',
                }}
                aria-label='이전 프로젝트'
              >
                <svg
                  width={`${24 * scale}`}
                  height={`${24 * scale}`}
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15 18L9 12L15 6'
                    stroke='white'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>

              {/* 우측 화살표 버튼 */}
              <button
                onClick={handleNext}
                disabled={currentIndex >= projects.length - 2}
                className='absolute flex items-center justify-center transition-opacity border rounded-full disabled:opacity-50 active:opacity-70 focus:outline-none'
                onMouseDown={(e) => {
                  e.currentTarget.style.opacity = '0.7'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.opacity = ''
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = ''
                }}
                style={{
                  width: `${buttonSize}px`,
                  height: `${buttonSize}px`,
                  left: `${rightButtonLeftValue}px`,
                  top: `${(710 - 190 - 293 - 92) * scale}px`,
                  background: '#FFFFFF',
                  borderColor: '#1A1A1A',
                }}
                aria-label='다음 프로젝트'
              >
                <svg
                  width={`${24 * scale}`}
                  height={`${24 * scale}`}
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9 18L15 12L9 6'
                    stroke='#1A1A1A'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>

              {/* More project? 버튼 */}
              <Link
                to='/projects'
                className='absolute flex items-center justify-center transition-opacity border rounded-lg hover:opacity-80'
                style={{
                  width: `${280 * scale}px`,
                  height: `${120 * scale}px`,
                  left: `${moreButtonLeftValue}px`,
                  top: `${(838 - 190 - 293 - 92) * scale}px`,
                  background: '#1A1A1A',
                  borderColor: '#FFFFFF',
                }}
              >
                <span
                  className='font-bold text-center text-white'
                  style={{
                    fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                    fontSize: `${28 * scale}px`,
                    lineHeight: `${36 * scale}px`,
                  }}
                >
                  More project?
                </span>
              </Link>

              {/* 프로젝트 카드 슬라이더 - 화면 전체 너비 기준 */}
              <div
                className='absolute overflow-hidden'
                style={{
                  left: `${(437 + 200 + 100) * scale}px`,
                  top: `${(92 - 200 + 120) * scale}px`,
                  right: `${48 * scale}px`,
                  height: `${cardHeight}px`,
                }}
              >
                <div
                  className='flex select-none'
                  style={{
                    transform: `translateX(calc(-${
                      currentIndex * (cardWidth + cardGap)
                    }px + ${dragOffset}px))`,
                    width: `${(cardWidth + cardGap) * projects.length - cardGap}px`,
                    transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
                    touchAction: 'pan-y',
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={onPointerUp}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                  onTouchCancel={onPointerUp}
                >
                  {projects.map((project, index) => {
                    // 전체 프로젝트 데이터에서 상세 정보 가져오기 (이미 위에서 가져온 allProjects 사용)
                    const fullProject = allProjects.find((p) => p.id === project.id)
                    return (
                      <div
                        key={project.id}
                        onClick={() => {
                          if (dragMovedRef.current) return
                          if (fullProject && fullProject.detail) {
                            setSelectedProject(fullProject)
                            setIsModalOpen(true)
                          }
                        }}
                        className='flex-shrink-0 relative rounded-xl border bg-[#1A1A1A] block cursor-pointer hover:opacity-90 transition-opacity'
                        style={{
                          width: `${cardWidth}px`,
                          height: `${cardHeight}px`,
                          marginRight: index < projects.length - 1 ? `${cardGap}px` : '0',
                          borderColor: '#FFFFFF',
                          boxShadow: '0px 2px 4px rgba(255, 255, 255, 0.15)',
                        }}
                        onMouseEnter={(e) => {
                          const numberEl = e.currentTarget.querySelector('.project-number')
                          if (numberEl) {
                            numberEl.style.color = '#FB923C'
                            numberEl.style.textShadow =
                              '0 0 6px rgba(251, 146, 60, 0.5), 0 0 10px rgba(251, 146, 60, 0.3)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          const numberEl = e.currentTarget.querySelector('.project-number')
                          if (numberEl) {
                            numberEl.style.color = '#5E5E5E'
                            numberEl.style.textShadow = 'none'
                          }
                        }}
                      >
                        {/* 프로젝트 이미지 */}
                        <div
                          className='absolute'
                          style={{
                            width: `${165 * scale}px`, // 185 - 20 = 165
                            height: `${165 * scale}px`, // 185 - 20 = 165
                            left: `${54 * scale}px`,
                            top: `${26 * scale}px`, // 상단 여백 26px
                          }}
                        >
                          <img
                            src={project.image}
                            alt={project.title}
                            className='object-cover w-full h-full'
                          />
                        </div>

                        {/* 프로젝트 제목 */}
                        <div
                          className='absolute font-bold text-white whitespace-nowrap'
                          style={{
                            fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                            fontSize: `${40 * scale}px`,
                            lineHeight: `${51 * scale}px`,
                            left: `${54 * scale}px`,
                            top: `${(26 + 165 + 20 + 22) * scale}px`, // 이미지 하단(26 + 165) + 간격(20) + 하단 이동(22)
                            width: `${(cardWidth - 54 - 78 - 20) * scale}px`, // 카드 너비 - 좌측 여백 - 번호 영역 - 간격
                            height: `${51 * scale}px`,
                          }}
                        >
                          {project.title}
                        </div>

                        {/* 프로젝트 설명 */}
                        <div
                          className='absolute font-bold text-white whitespace-nowrap'
                          style={{
                            fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                            fontSize: `${24 * scale}px`,
                            lineHeight: `${31 * scale}px`,
                            left: `${54 * scale}px`,
                            top: `${(26 + 165 + 20 + 51 + 10 + 22) * scale}px`, // 제목 하단 + 간격 + 하단 이동(22)
                            width: `${(cardWidth - 54 - 78 - 20) * scale}px`, // 카드 너비 - 좌측 여백 - 번호 영역 - 간격
                            height: `${31 * scale}px`,
                          }}
                        >
                          {project.desc}
                        </div>

                        {/* 프로젝트 번호 */}
                        <div
                          className='absolute flex items-center justify-center font-bold project-number'
                          style={{
                            fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                            fontSize: `${70 * scale}px`,
                            lineHeight: `${89 * scale}px`,
                            color: '#5E5E5E',
                            right: `${36 * scale}px`, // 우측 여백 36px
                            bottom: `${22 * scale}px`, // 하단 여백 22px
                            width: `${78 * scale}px`,
                            height: `${89 * scale}px`,
                            transition: 'color 0.3s ease, text-shadow 0.3s ease',
                          }}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* 프로젝트 상세 모달 */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProject(null)
        }}
      />
    </div>
  )
}
