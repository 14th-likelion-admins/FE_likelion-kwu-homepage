/**
 * ============================================================================
 * ProjectDetailModal.jsx - 프로젝트 상세 모달 컴포넌트 (스크롤 문제 완전 해결)
 * ============================================================================
 *
 * 프로젝트의 상세 정보를 모달 형태로 표시하는 컴포넌트입니다.
 *
 * 사용 방법:
 * <ProjectDetailModal
 *   project={selectedProject}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 * />
 *
 * 수정 사항:
 * - return null 이전에 스크롤 복원을 처리하도록 변경
 * - removeProperty 사용으로 스타일 완전 제거
 * - 별도의 useEffect로 스크롤 관리 분리
 *
 * ============================================================================
 */

import { useEffect, useRef } from 'react'
import ImageCarousel from './ImageCarousel'

export const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  const modalRef = useRef(null)
  const scrollPositionRef = useRef(0)
  const didPushModalHistoryRef = useRef(false)
  const closedByPopStateRef = useRef(false)

  // 스크롤 관리 - isOpen 변경 시마다 실행
  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때
      scrollPositionRef.current = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
    } else {
      // 모달 닫힐 때
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('position')
      document.body.style.removeProperty('top')
      document.body.style.removeProperty('width')
      window.scrollTo(0, scrollPositionRef.current)
    }

    // cleanup - 컴포넌트 unmount 시
    return () => {
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('position')
      document.body.style.removeProperty('top')
      document.body.style.removeProperty('width')
    }
  }, [isOpen])

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // 모바일: 뒤로가기를 누르면 페이지 이동 대신 모달만 닫히도록 히스토리 엔트리 추가
  useEffect(() => {
    if (!isOpen) return
    if (!window.matchMedia('(max-width: 767px)').matches) return

    closedByPopStateRef.current = false
    window.history.pushState({ ...window.history.state, __projectModal: true }, '')
    didPushModalHistoryRef.current = true

    const handlePopState = () => {
      closedByPopStateRef.current = true
      onClose()
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onClose])

  // 뒤로가기로 닫힌 경우가 아니면, 모달이 push한 히스토리 엔트리를 정리
  useEffect(() => {
    if (isOpen) return
    if (!didPushModalHistoryRef.current) return

    if (!closedByPopStateRef.current) {
      window.history.back()
    }

    didPushModalHistoryRef.current = false
    closedByPopStateRef.current = false
  }, [isOpen])

  // 모달이 닫혀있거나 프로젝트 데이터가 없으면 렌더링하지 않음
  if (!isOpen || !project) return null

  const displayProject = project.detail ? project : null

  return (
    <>
      {/* 배경 블러 오버레이 - 클릭 시 모달 닫기 */}
      <div
        className='fixed inset-0 z-50 flex items-center justify-center cursor-pointer'
        onClick={onClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {/* 모달 컨텐츠 */}
        <div
          ref={modalRef}
          className='relative bg-white shadow-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden'
          style={{
            maxWidth: '720px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            padding: 0,
            margin: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div
            className='overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {/* 프로젝트 이미지 - 최상단에 딱 붙임 */}
            <div
              className='relative w-full'
              style={{
                margin: 0,
                padding: 0,
                paddingBottom: '24px',
                lineHeight: 0,
                display: 'block',
              }}
            >
              <button
                type='button'
                onClick={onClose}
                aria-label='닫기'
                className='absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white md:hidden'
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '22px',
                  fontWeight: 200,
                  lineHeight: 1,
                }}
              >
                x
              </button>
              {displayProject && (
                <ImageCarousel
                  images={
                    displayProject.detail.images?.length
                      ? displayProject.detail.images
                      : [displayProject.detail.thumbnail]
                  }
                  alt={displayProject.title}
                />
              )}
            </div>

            {/* 프로젝트 설명 */}
            <div className='px-6 pt-0 pb-6 md:px-8 md:pb-8'>
              {!displayProject ? (
                <div
                  className='py-12 text-center text-gray-500'
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  프로젝트 정보를 불러오지 못했습니다.
                </div>
              ) : (
                <>
                  {/* 프로젝트 개요 */}
                  <div className='mb-8'>
                    {/* 기수 / 활동 종류 배지 */}
                    {(displayProject.generation || displayProject.activity) && (
                      <div className='flex flex-wrap items-center gap-2 mb-4'>
                        {displayProject.generation && displayProject.generation !== '미지정' && (
                          <span
                            className='inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-gray-700'
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            {displayProject.generation}
                          </span>
                        )}
                        {displayProject.activity && displayProject.activity !== '미지정' && (
                          <span
                            className='inline-flex items-center rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-orange-600'
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '12px',
                              fontWeight: 500,
                            }}
                          >
                            {displayProject.activity}
                          </span>
                        )}
                      </div>
                    )}
                    <h3
                      className='mb-4 text-xl font-bold text-gray-900'
                      style={{
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      📍 프로젝트 개요
                    </h3>
                    <div
                      className='leading-relaxed text-gray-700 whitespace-pre-line'
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        lineHeight: '1.8',
                      }}
                    >
                      {displayProject.detail.overview.split(/\*\*(.*?)\*\*/g).map((text, index) => {
                        if (index % 2 === 1) {
                          return <strong key={index}>{text}</strong>
                        }
                        return <span key={index}>{text}</span>
                      })}
                    </div>
                  </div>

                  {/* 주요 기능 */}
                  <div className='mb-8'>
                    <h3
                      className='mb-4 text-xl font-bold text-gray-900'
                      style={{
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      📍 주요 기능
                    </h3>
                    <ul className='space-y-2 list-none'>
                      {displayProject.detail.features.map((feature, index) => (
                        <li
                          key={index}
                          className='flex items-start text-gray-700'
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '16px',
                            lineHeight: '1.8',
                          }}
                        >
                          <span className='mr-2'>-</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectDetailModal
