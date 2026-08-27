/**
 * ============================================================================
 * Projects.jsx - 프로젝트 목록 페이지 (Updated)
 *
 * 이 파일은 프로젝트 목록을 표시하고, 필터링 및 무한 스크롤 기능을 제공하는
 * 페이지입니다. 기존 구현에서 기수와 활동 드롭다운의 모서리 둥글기와
 * 가로 크기를 조절하여 보다 깔끔한 UI를 구현합니다.
 *
 * 변경 사항:
 * 1. 기수 드롭다운의 각 항목 모서리 둥글기를 "기수" 버튼의 둥글기와
 *    비슷한 정도로 줄여 좀 더 각진 느낌이 들도록 수정했습니다. 각 항목에
 *    불필요한 `rounded-full` 클래스를 제거하고, 첫 번째와 마지막 항목에만
 *    작은 반경(`rounded-t-lg` 및 `rounded-b-lg`)을 부여했습니다. 전체
 *    드롭다운 박스에는 `rounded-lg`를 적용해 버튼과 유사한 외형을 유지합니다.
 *
 * 2. 활동 드롭다운의 드롭다운 박스는 좌측 기준 위치를 유지한 채 우측으로만
 *    넓어지도록 `whiteSpace: 'nowrap'`과 `minWidth: '150px'` 스타일을
 *    추가했습니다. 이를 통해 긴 항목 이름(예: "권역별 연합해커톤")도 줄바꿈
 *    없이 깔끔하게 표시됩니다. 이 드롭다운 역시 모서리 둥글기를 줄여
 *    `rounded-lg`를 사용하고, 각 항목에는 `rounded-t-lg`, `rounded-b-lg`
 *    클래스를 적용했습니다.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProjectDetailModal from '../components/ProjectDetailModal'
import ProjectFormModal from '../components/ProjectFormModal'
import useProjects from '../hooks/useProjects'

export default function Projects() {
  const [selectedGeneration, setSelectedGeneration] = useState('기수')
  const [showGenerationDropdown, setShowGenerationDropdown] = useState(false)
  const [displayedProjects, setDisplayedProjects] = useState(12) // 초기 표시 개수
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const [searchParams] = useSearchParams()
  const projectIdParam = searchParams.get('id')

  // 프로젝트 데이터 (정적 17개 + 백엔드 등록 프로젝트 병합)
  const { allProjects, refetch: refetchProjects } = useProjects()

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
    return allProjects.filter((project) => {
      const genMatch =
        selectedGeneration === '기수' ||
        selectedGeneration === '전체' ||
        project.generation === selectedGeneration
      const actMatch = true
      return genMatch && actMatch
    })
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

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowGenerationDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      <main className='relative px-4 pt-12 pb-16 mx-auto md:pt-20 md:px-6 lg:px-8 max-w-7xl'>
        {/* 제목과 뒤로가기 버튼 */}
        <div className='flex items-center gap-4 mt-4 mb-6 md:mb-12 md:mt-12'>
          <Link
            to='/projectshome'
            className='items-center justify-center flex-shrink-0 hidden md:flex'
            style={{
              width: '24px',
              height: '24px',
            }}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M15 18L9 12L15 6'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </Link>
          <h2
            className='hidden m-0 text-lg font-bold md:block md:text-xl lg:text-2xl'
            style={{
              fontFamily: "'Space Grotesk', Helvetica, sans-serif",
              lineHeight: '1.2',
            }}
          >
            멋쟁이사자처럼에서 진행된 프로젝트
          </h2>
        </div>

        {/* 드롭다운 필터 */}
        <div className='flex flex-wrap gap-4 pl-0 mt-6 mb-6'>
          {/* 기수 드롭다운 */}
          <div className='relative dropdown-container'>
            <button
              onClick={() => {
                setShowGenerationDropdown(!showGenerationDropdown)
              }}
              className='border border-white rounded-full px-4 py-2 flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-white/10 transition-colors'
              style={{
                fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                fontSize: 'clamp(12px, 1vw, 16px)',
                fontWeight: 300,
                minWidth: '100px',
              }}
            >
              <span>{selectedGeneration}</span>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={{ transform: 'rotate(90deg)' }}
              >
                <path
                  d='M9 18L15 12L9 6'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            {showGenerationDropdown && (
              <div
                className='absolute mt-2 border border-white rounded-2xl bg-[#1A1A1A] z-50 min-w-full shadow-lg'
                style={{ overflow: 'visible' }}
              >
                {generations.map((gen) => (
                  <button
                    key={gen}
                    onClick={() => {
                      setSelectedGeneration(gen)
                      setDisplayedProjects(12)
                      setShowGenerationDropdown(false)
                    }}
                    className='w-full px-6 py-3 text-center transition-colors md:px-8 md:py-4 hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg'
                    style={{
                      fontFamily: "'Space Grotesk', Helvetica, sans-serif",
                      fontSize: 'clamp(12px, 1vw, 16px)',
                      fontWeight: 300,
                    }}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 활동 드롭다운 (삭제됨) */}

          {/* 프로젝트 등록 버튼 */}
          <button
            type='button'
            onClick={() => setIsFormOpen(true)}
            className='border border-white rounded-full px-4 py-2 flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-white/10 transition-colors'
            style={{
              fontFamily: "'Space Grotesk', Helvetica, sans-serif",
              fontSize: 'clamp(12px, 1vw, 16px)',
              fontWeight: 300,
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
              className='border border-white/50 rounded-3xl bg-[#1A1A1A] overflow-hidden hover:border-white transition-colors cursor-pointer'
              onClick={() => {
                setSelectedProject(project)
                setIsModalOpen(true)
              }}
            >
              {/* 프로젝트 이미지 컨테이너 - 좌우여백 37.5, 상단 여백 34 */}
              <div
                className='relative'
                style={{
                  paddingLeft: '37.5px',
                  paddingRight: '37.5px',
                  paddingTop: '34px',
                }}
              >
                <div
                  className='w-full border border-white rounded-3xl overflow-hidden bg-[#1A1A1A]'
                  style={{
                    aspectRatio: '375 / 211',
                  }}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className='object-cover w-full h-full'
                    />
                  ) : (
                    <div className='flex items-center justify-center w-full h-full text-sm text-white/30'>
                      이미지 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 프로젝트 정보 */}
              <div className='p-6 md:p-8'>
                {/* 프로젝트 제목과 태그 */}
                <div className='flex items-end gap-0 mb-4'>
                  <span
                    className='text-white'
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'clamp(20px, 2.5vw, 24px)',
                      lineHeight: '1.2',
                      fontWeight: 500,
                    }}
                  >
                    {project.title}
                  </span>
                  <span
                    className='font-bold text-white/50'
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 'clamp(14px, 1.8vw, 18px)',
                      lineHeight: '1.2',
                      marginLeft: '20px',
                    }}
                  >
                    {project.tag}
                  </span>
                </div>

                {/* 프로젝트 설명 */}
                <p
                  className='text-white'
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    lineHeight: '1.2',
                  }}
                >
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 무한스크롤 감지 요소 */}
        {displayedProjects < allProjects.length && (
          <div ref={observerTarget} className='flex items-center justify-center py-8'>
            {isLoading && <div className='text-white/50'>로딩 중...</div>}
          </div>
        )}

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
        onCreated={refetchProjects}
      />
      <Footer />
    </div>
  )
}
