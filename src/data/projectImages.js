/**
 * ============================================================================
 * projectImages.js - 프로젝트 이미지 관리
 * ============================================================================
 * 
 * 이 파일은 프로젝트의 메인 이미지와 카드용 축소본을 관리합니다.
 * 
 * 새로운 프로젝트 이미지 추가 방법:
 * 1. src/assets/ 폴더에 이미지 파일 추가
 * 2. 아래 Import 섹션에 import 문 추가
 * 3. projectImages 맵에 추가
 * 
 * ============================================================================
 */

// 카드 srcSet의 가장 큰 후보로 쓰는 원본 폭 (generate-card-variants.mjs가 생성)
import projectImageWidths from './projectImageWidths.json'

// ============================================================================
// 프로젝트 메인 이미지 Import
// ============================================================================
// 형식: projects-image-{번호}.{확장자}
// 확장자: .webp
// 현재 프로젝트: 1-17번 (총 17개)
// ============================================================================
import projectImage1 from '../assets/projects-image-1.webp'
import projectImage2 from '../assets/projects-image-2.webp'
import projectImage3 from '../assets/projects-image-3.webp'
import projectImage4 from '../assets/projects-image-4.webp'
import projectImage5 from '../assets/projects-image-5.webp'
import projectImage6 from '../assets/projects-image-6.webp'
import projectImage7 from '../assets/projects-image-7.webp'
import projectImage8 from '../assets/projects-image-8.webp'
import projectImage9 from '../assets/projects-image-9.webp'
import projectImage10 from '../assets/projects-image-10.webp'
import projectImage11 from '../assets/projects-image-11.webp'
import projectImage12 from '../assets/projects-image-12.webp'
import projectImage13 from '../assets/projects-image-13.webp'
import projectImage14 from '../assets/projects-image-14.webp'
import projectImage15 from '../assets/projects-image-15.webp'
import projectImage16 from '../assets/projects-image-16.webp'
import projectImage17 from '../assets/projects-image-17.webp'
// 새로운 프로젝트 이미지 추가 시 위에 import 문 추가

// ============================================================================
// 프로젝트 이미지 맵
// ============================================================================
// 프로젝트 id를 키로 하여 메인 이미지를 저장
// 키: 프로젝트 id (숫자)
// 값: import된 이미지 모듈
// 
// 새로운 프로젝트 추가 시: projectImages[프로젝트번호] = projectImage{번호}
// ============================================================================
export const projectImages = {
  1: projectImage1,
  2: projectImage2,
  3: projectImage3,
  4: projectImage4,
  5: projectImage5,
  6: projectImage6,
  7: projectImage7,
  8: projectImage8,
  9: projectImage9,
  10: projectImage10,
  11: projectImage11,
  12: projectImage12,
  13: projectImage13,
  14: projectImage14,
  15: projectImage15,
  16: projectImage16,
  17: projectImage17,
  // 새로운 프로젝트 추가: {프로젝트번호}: projectImage{번호},
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 프로젝트 메인 이미지를 가져오는 함수
 * @param {number} projectId - 프로젝트 id
 * @returns {string|null} 프로젝트 이미지 URL 또는 null
 */
export const getProjectImage = (projectId) => {
  return projectImages[projectId] || null
}

// ============================================================================
// 카드 전용 축소본 (srcSet)
// ============================================================================
// Projects 목록 카드는 데스크탑에서 309px 폭으로 그려지는데 메인 이미지 원본은
// 최대 1600px입니다. 그대로 내려받으면 카드 한 장에 필요한 픽셀의 수십 배를 쓰게
// 되므로, 폭별 축소본을 srcSet으로 넘겨 브라우저가 고르게 합니다.
//
// 축소본은 scripts/generate-card-variants.mjs가 만들어 내는 파생 파일입니다.
// 위쪽 import 목록과 달리 import 문을 손으로 늘리지 않아도 되도록 glob으로 모읍니다.
// 파일명의 `-{폭}w`가 곧 srcSet에 쓰이는 폭입니다.
//
// 가장 큰 후보는 축소본이 아니라 원본입니다. 원본 폭은 파일명에 없으므로 같은
// 스크립트가 써 주는 projectImageWidths.json에서 읽습니다.
// ============================================================================
const cardVariantUrls = import.meta.glob('../assets/projects-image-*w.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const projectCardSrcSets = (() => {
  const candidatesByProjectId = new Map()

  const addCandidate = (projectId, url, width) => {
    const candidates = candidatesByProjectId.get(projectId) || []
    candidates.push({ url, width })
    candidatesByProjectId.set(projectId, candidates)
  }

  for (const [filePath, url] of Object.entries(cardVariantUrls)) {
    const match = /projects-image-(\d+)-(\d+)w\.webp$/.exec(filePath)
    if (match) {
      addCandidate(match[1], url, Number(match[2]))
    }
  }

  for (const [projectId, originalWidth] of Object.entries(projectImageWidths)) {
    if (projectImages[projectId]) {
      addCandidate(projectId, projectImages[projectId], originalWidth)
    }
  }

  const srcSets = {}
  for (const [projectId, candidates] of candidatesByProjectId) {
    candidates.sort((left, right) => left.width - right.width)
    srcSets[projectId] = candidates.map(({ url, width }) => `${url} ${width}w`).join(', ')
  }
  return srcSets
})()

/**
 * 프로젝트 카드용 srcSet 문자열을 가져오는 함수
 *
 * 축소본이 없는 프로젝트(등록 폼으로 새로 올라온 프로젝트 등)는 null을 반환하며,
 * 이 경우 카드는 src 하나만 쓰는 기존 동작으로 돌아갑니다.
 *
 * @param {number} projectId - 프로젝트 id
 * @returns {string|null} srcSet 문자열 또는 null
 */
export const getProjectCardSrcSet = (projectId) => projectCardSrcSets[projectId] || null
