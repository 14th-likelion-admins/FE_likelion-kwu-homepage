/**
 * ============================================================================
 * mergeProjects.js - 백엔드 프로젝트 응답을 정적 프로젝트와 같은 shape으로 변환
 * ============================================================================
 *
 * 기존 17개 프로젝트(projectsData.js)는 그대로 유지하고, 백엔드에 새로 등록된
 * 프로젝트만 이 어댑터를 거쳐 같은 화면 컴포넌트(Projects.jsx, ProjectsHome.jsx,
 * ProjectDetailModal.jsx)에서 재사용할 수 있는 shape으로 변환합니다.
 *
 * 백엔드 목록 응답(GET /api/projects)은 요약 필드만 내려줄 수 있어 image/activity가
 * 없을 수 있습니다. 상세 조회(GET /api/projects/{id}) 시 mergeBackendDetail로
 * 채워 넣습니다.
 * ============================================================================
 */

// 정적 프로젝트(숫자 id 1~17)와 절대 충돌하지 않도록 문자열 id로 감쌉니다.
export const toDisplayProject = (res) => {
  const images = Array.isArray(res.images) ? res.images : []
  const thumbnail = res.thumbnailUrl || images[0] || null

  return {
    id: `backend-${res.id}`,
    source: 'backend',
    backendId: res.id,
    title: res.title,
    tag: res.tag,
    description: res.description,
    generation: res.generation,
    activity: res.activity || null,
    image: thumbnail,
    thumbnail,
    detail:
      res.overview != null
        ? {
            thumbnail,
            images: images.length > 0 ? images : thumbnail ? [thumbnail] : [],
            overview: res.overview,
            features: Array.isArray(res.features) ? res.features : [],
          }
        : null,
  }
}

export const mergeBackendDetail = (project, detailRes) => {
  const images = Array.isArray(detailRes.images) ? detailRes.images : []
  const thumbnail = images[0] || project.thumbnail || null

  return {
    ...project,
    generation: detailRes.generation ?? project.generation,
    activity: detailRes.activity ?? project.activity,
    image: thumbnail,
    thumbnail,
    detail: {
      thumbnail,
      images,
      overview: detailRes.overview,
      features: Array.isArray(detailRes.features) ? detailRes.features : [],
    },
  }
}
