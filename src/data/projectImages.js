/**
 * ============================================================================
 * projectImages.js - 프로젝트 이미지 관리
 * ============================================================================
 * 
 * 이 파일은 프로젝트의 메인 이미지와 썸네일 이미지를 관리합니다.
 * 
 * 새로운 프로젝트 이미지 추가 방법:
 * 1. src/assets/ 폴더에 이미지 파일 추가
 * 2. 아래 Import 섹션에 import 문 추가
 * 3. projectImages 또는 projectThumbnails 맵에 추가
 * 
 * ============================================================================
 */

// ============================================================================
// 프로젝트 메인 이미지 Import
// ============================================================================
// 형식: projects-image-{번호}.{확장자}
// 확장자: .png, .jpg, .jpeg 지원
// 현재 프로젝트: 1-17번 (총 17개)
// ============================================================================
import projectImage1 from '../assets/projects-image-1.png'
import projectImage2 from '../assets/projects-image-2.png'
import projectImage3 from '../assets/projects-image-3.png'
import projectImage4 from '../assets/projects-image-4.png'
import projectImage5 from '../assets/projects-image-5.png'
import projectImage6 from '../assets/projects-image-6.png'
import projectImage7 from '../assets/projects-image-7.png'
import projectImage8 from '../assets/projects-image-8.png'
import projectImage9 from '../assets/projects-image-9.png'
import projectImage10 from '../assets/projects-image-10.jpg'
import projectImage11 from '../assets/projects-image-11.png'
import projectImage12 from '../assets/projects-image-12.jpeg'
import projectImage13 from '../assets/projects-image-13.png'
import projectImage14 from '../assets/projects-image-14.png'
import projectImage15 from '../assets/projects-image-15.png'
import projectImage16 from '../assets/projects-image-16.png'
import projectImage17 from '../assets/projects-image-17.png'
// 새로운 프로젝트 이미지 추가 시 위에 import 문 추가

// ============================================================================
// 프로젝트 썸네일 이미지 Import
// ============================================================================
// 형식: projects-thumbnail-{번호}.png
// 주의: 썸네일이 없어도 동작하지만, 있으면 ProjectsHome에서 사용됩니다.
// 현재 프로젝트: 1-17번 (총 17개)
// ============================================================================
import projectThumbnail1 from '../assets/projects-thumbnail-1.png'
import projectThumbnail2 from '../assets/projects-thumbnail-2.png'
import projectThumbnail3 from '../assets/projects-thumbnail-3.png'
import projectThumbnail4 from '../assets/projects-thumbnail-4.png'
import projectThumbnail5 from '../assets/projects-thumbnail-5.png'
import projectThumbnail6 from '../assets/projects-thumbnail-6.png'
import projectThumbnail7 from '../assets/projects-thumbnail-7.png'
import projectThumbnail8 from '../assets/projects-thumbnail-8.png'
import projectThumbnail9 from '../assets/projects-thumbnail-9.png'
import projectThumbnail10 from '../assets/projects-thumbnail-10.png'
import projectThumbnail11 from '../assets/projects-thumbnail-11.png'
import projectThumbnail12 from '../assets/projects-thumbnail-12.png'
import projectThumbnail13 from '../assets/projects-thumbnail-13.png'
import projectThumbnail14 from '../assets/projects-thumbnail-14.png'
import projectThumbnail15 from '../assets/projects-thumbnail-15.png'
import projectThumbnail16 from '../assets/projects-thumbnail-16.png'
import projectThumbnail17 from '../assets/projects-thumbnail-17.png'
// 새로운 프로젝트 썸네일 추가 시 위에 import 문 추가

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
// 프로젝트 썸네일 이미지 맵
// ============================================================================
// 프로젝트 id를 키로 하여 썸네일 이미지를 저장
// 키: 프로젝트 id (숫자)
// 값: import된 썸네일 이미지 모듈
// 
// 주의: 썸네일이 없으면 자동으로 메인 이미지를 사용합니다 (fallback)
// 새로운 프로젝트 추가 시: projectThumbnails[프로젝트번호] = projectThumbnail{번호}
// ============================================================================
export const projectThumbnails = {
  1: projectThumbnail1,
  2: projectThumbnail2,
  3: projectThumbnail3,
  4: projectThumbnail4,
  5: projectThumbnail5,
  6: projectThumbnail6,
  7: projectThumbnail7,
  8: projectThumbnail8,
  9: projectThumbnail9,
  10: projectThumbnail10,
  11: projectThumbnail11,
  12: projectThumbnail12,
  13: projectThumbnail13,
  14: projectThumbnail14,
  15: projectThumbnail15,
  16: projectThumbnail16,
  17: projectThumbnail17,
  // 새로운 프로젝트 썸네일 추가: {프로젝트번호}: projectThumbnail{번호},
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

/**
 * 프로젝트 썸네일 이미지를 가져오는 함수
 * 썸네일이 없으면 메인 이미지를 반환합니다 (fallback)
 * @param {number} projectId - 프로젝트 id
 * @returns {string|null} 썸네일 이미지 URL 또는 메인 이미지 URL 또는 null
 */
export const getThumbnailImageSync = (projectId) => {
  // 썸네일 이미지가 있으면 우선 사용
  if (projectThumbnails[projectId]) {
    return projectThumbnails[projectId]
  }
  // 썸네일이 없으면 메인 이미지 사용 (fallback)
  return projectImages[projectId] || null
}
