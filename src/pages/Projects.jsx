/**
 * ============================================================================
 * Projects.jsx - 프로젝트 목록 페이지
 *
 * 페이지 맨 위는 배너 이미지 한 장이 전부다. 배너에 문구가 이미 새겨져 있어서
 * 페이지 쪽에는 제목 텍스트를 두지 않는다(오버레이하면 두 번 읽힌다).
 * 목록 시트는 배너 위로 조금 올라와 둥근 모서리로 겹치게 두어, 배너와 목록이
 * 한 덩어리로 보이게 한다.
 *
 * 기수 필터는 드롭다운이 아니라 한 줄 pill로 모두 펼쳐 둔다. 기수는 예닐곱 개뿐이라
 * 접어 둘 이유가 없고, 지금 어떤 기수를 보고 있는지도 한눈에 보인다.
 * 프로젝트 등록은 같은 줄 오른쪽 끝에 아웃라인 없는 텍스트 버튼으로 두어,
 * 필터 pill과 성격이 다른 동작임을 외형으로 구분한다.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProjectDetailModal from '../components/ProjectDetailModal'
import ProjectFormModal from '../components/ProjectFormModal'
import useProjects from '../hooks/useProjects'
import heroBanner960 from '../assets/projects-hero-banner-960w.webp'
import heroBanner1600 from '../assets/projects-hero-banner-1600w.webp'
import heroBanner2400 from '../assets/projects-hero-banner-2400w.webp'

// 카드 이미지가 실제로 그려지는 폭. 카드는 이미지가 카드 폭을 꽉 채우므로
// 아래 그리드의 컨테이너 좌우 여백과 gap만 빼면 된다.
// 열 수는 getColumns()가 768 / 1280을 경계로 정하므로 미디어 쿼리도 같은 값을 쓴다.
//   ~767   1열, 컨테이너 px-4 -> 100vw - 32
//   ~1279  2열, 컨테이너 px-6, gap-8 -> (100vw - 48 - 32) / 2 = 50vw - 40
//   1280~  3열, max-w-7xl(1280) + lg:px-8, gap-8 -> (1216 - 64) / 3 = 384px
//
// 1024~1279는 lg:px-8이 먼저 걸려 실제로는 50vw - 48이라 위 식이 8px 크게 잡는다.
// sizes는 실제보다 크게 잡히는 쪽이 안전해서(후보를 한 단계 크게 고른다) 그냥 둔다.
const CARD_IMAGE_SIZES =
  '(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) calc(50vw - 40px), 384px'

// 배너 원본 비율(11511 x 2447). 좁은 화면에서 비율대로 두면 띠가 너무 얇아지므로
// 최소 높이를 주고, 잘릴 때는 문구가 있는 왼쪽을 남긴다.
const HERO_ASPECT = '11511 / 2447'

export default function Projects() {
  const [selectedGeneration, setSelectedGeneration] = useState('전체')
  const [displayedProjects, setDisplayedProjects] = useState(12) // 초기 표시 개수
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [searchParams] = useSearchParams()
  const projectIdParam = searchParams.get('id')

  // 프로젝트 데이터 (정적 17개 + 등록된 프로젝트 병합)
  const { allProjects, addProject } = useProjects()

  // 기수 목록은 실제 프로젝트 데이터에서 동적으로 추출 (최신 기수가 먼저)
  const generations = useMemo(() => {
    const unique = Array.from(new Set(allProjects.map((p) => p.generation).filter(Boolean)))
    unique.sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0))
    return ['전체', ...unique]
  }, [allProjects])

  // 화면 너비에 따른 열 개수 계산
  const getColumns = () => {
    const width = window.innerWidth
    if (width < 768) return 1 // 모바일
    if (width < 1280) return 2 // 태블릿
    return 3 // 데스크탑
  }

  const [columns, setColumns] = useState(getColumns())

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredProjects = useMemo(() => {
    if (selectedGeneration === '전체') return allProjects
    return allProjects.filter((project) => project.generation === selectedGeneration)
  }, [allProjects, selectedGeneration])

  // 필터 변경 시 표시 개수 초기화
  // 무한스크롤 구현
  const loadMoreProjects = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)
    setTimeout(() => {
      setDisplayedProjects((prev) => Math.min(prev + 12, filteredProjects.length))
      setIsLoading(false)
    }, 500)
  }, [isLoading, filteredProjects.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedProjects < filteredProjects.length) {
          loadMoreProjects()
        }
      },
      { threshold: 0.1 },
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [displayedProjects, filteredProjects.length, loadMoreProjects])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 특정 프로젝트로 스크롤
  useEffect(() => {
    if (projectIdParam) {
      const projectId = parseInt(projectIdParam, 10)
      const projectElement = document.getElementById(`project-${projectId}`)
      if (projectElement) {
        setTimeout(() => {
          projectElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // 하이라이트 효과
          projectElement.style.borderColor = '#FFFFFF'
          projectElement.style.transition = 'border-color 0.3s'
          setTimeout(() => {
            projectElement.style.borderColor = ''
          }, 2000)
        }, 100)
      }
    }
  }, [projectIdParam])

  const visibleProjects = filteredProjects.slice(0, displayedProjects)

  return (
    <div
      className='bg-[#1A1A1A] text-white font-sans min-h-screen'
      style={{ fontFamily: 'Space Grotesk' }}
    >
      <Header />

      <main className='relative'>
        {/* 상단 배너 - 문구가 이미지 안에 있어 별도 텍스트를 얹지 않는다.
            pt는 fixed 헤더 높이(모바일 44px, 데스크탑 52px)만큼만 비운다. */}
        <section className='pt-11 md:pt-[52px]'>
          <img
            src={heroBanner2400}
            srcSet={`${heroBanner960} 960w, ${heroBanner1600} 1600w, ${heroBanner2400} 2400w`}
            sizes='100vw'
            alt='ANIMAL LEAGUE'
            width='2400'
            height='510'
            fetchPriority='high'
            decoding='async'
            className='block w-full object-cover object-left min-h-[130px] md:min-h-0'
            style={{ aspectRatio: HERO_ASPECT }}
          />
        </section>

        {/* 목록 시트 - 배너 위로 겹쳐 올려 둥근 모서리로 이어 붙인다 */}
        <section className='relative z-10 -mt-6 md:-mt-10 rounded-t-[28px] md:rounded-t-[44px] bg-[#1A1A1A]'>
          <div className='px-4 pt-8 pb-16 mx-auto md:px-6 lg:px-8 max-w-7xl md:pt-12'>
            {/* 기수 필터 + 프로젝트 등록 */}
            <div className='flex items-center gap-4 pb-4 mb-8 border-b md:pb-5 md:mb-10 border-white/15'>
              <div
                className='flex items-center flex-1 min-w-0 gap-1 overflow-x-auto md:gap-2 [&::-webkit-scrollbar]:hidden'
                style={{ scrollbarWidth: 'none' }}
              >
                {generations.map((gen) => {
                  const isSelected = selectedGeneration === gen
                  return (
                    <button
                      key={gen}
                      type='button'
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedGeneration(gen)
                        setDisplayedProjects(12)
                      }}
                      className={`flex-shrink-0 rounded-full px-4 py-2 md:px-5 transition-colors ${
                        isSelected
                          ? 'bg-white text-[#1A1A1A]'
                          : 'text-white/45 hover:text-white hover:bg-white/10'
                      }`}
                      style={{
                        fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                        fontSize: 'clamp(13px, 1vw, 16px)',
                        fontWeight: isSelected ? 600 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {gen}
                    </button>
                  )
                })}
              </div>

              <button
                type='button'
                onClick={() => setIsFormOpen(true)}
                className='flex-shrink-0 py-2 transition-colors text-white/60 hover:text-white'
                style={{
                  fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                  fontSize: 'clamp(13px, 1vw, 16px)',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                }}
              >
                + 프로젝트 등록
              </button>
            </div>

            {/* 프로젝트 그리드 */}
            <div
              className='grid gap-6 md:gap-8'
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {visibleProjects.map((project) => (
                <div
                  key={project.id}
                  id={`project-${project.id}`}
                  className='border border-white/10 rounded-3xl bg-white/[0.04] overflow-hidden hover:border-white/40 transition-colors cursor-pointer'
                  onClick={() => {
                    setSelectedProject(project)
                    setIsModalOpen(true)
                  }}
                >
                  {/* 프로젝트 이미지 - 카드 폭을 꽉 채운다 */}
                  <div
                    className='w-full overflow-hidden bg-[#111111]'
                    style={{ aspectRatio: '375 / 211' }}
                  >
                    {project.image ? (
                      <img
                        src={project.image}
                        srcSet={project.cardSrcSet || undefined}
                        sizes={CARD_IMAGE_SIZES}
                        alt={project.title}
                        loading='lazy'
                        decoding='async'
                        className='object-cover w-full h-full'
                      />
                    ) : (
                      <div className='flex items-center justify-center w-full h-full text-sm text-white/30'>
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 프로젝트 정보 */}
                  <div className='p-5 md:p-6'>
                    {/* 프로젝트 제목과 태그 */}
                    <div className='flex items-end gap-3 mb-3'>
                      <span
                        className='text-white'
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 'clamp(20px, 2.5vw, 24px)',
                          lineHeight: '1.2',
                          fontWeight: 600,
                        }}
                      >
                        {project.title}
                      </span>
                      <span
                        className='font-bold text-white/40'
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 'clamp(13px, 1.6vw, 16px)',
                          lineHeight: '1.4',
                        }}
                      >
                        {project.tag}
                      </span>
                    </div>

                    {/* 프로젝트 설명 */}
                    <p
                      className='text-white/60'
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 400,
                        fontSize: 'clamp(14px, 1.6vw, 16px)',
                        lineHeight: '1.5',
                      }}
                    >
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 무한스크롤 감지 요소 */}
            {displayedProjects < filteredProjects.length && (
              <div ref={observerTarget} className='flex items-center justify-center py-8'>
                {isLoading && <div className='text-white/50'>로딩 중...</div>}
              </div>
            )}
          </div>
        </section>

        {/* UP 버튼 */}
        <button
          onClick={scrollToTop}
          className='fixed bottom-8 right-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#5E5E5E] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity z-50'
          aria-label='맨 위로'
        >
          <div
            className='w-3 h-3 border-4 border-black'
            style={{
              borderTop: 'none',
              borderRight: 'none',
              transform: 'rotate(135deg)',
            }}
          />
        </button>
      </main>

      {/* 프로젝트 상세 모달 */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProject(null)
        }}
      />

      {/* 프로젝트 등록 모달 */}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={addProject}
      />
      <Footer />
    </div>
  )
}
