import { useMemo, useState } from 'react'
import { getAllProjects as getBaseProjects } from '../data/projectsData'

/**
 * 정적 17개 + registeredProjects.json 데이터를 합친 프로젝트 목록을 제공하는 훅.
 *
 * 등록은 GitHub 커밋 → Vercel 재배포를 거쳐야 registeredProjects.json에 실제로
 * 반영되므로, 새로 등록한 프로젝트는 addProject로 목록 맨 앞에 optimistic하게
 * 붙여서 새로고침 전에도 바로 보이게 한다.
 */
export default function useProjects() {
  const baseProjects = useMemo(() => getBaseProjects(), [])
  const [optimisticProjects, setOptimisticProjects] = useState([])

  const addProject = (project) => {
    setOptimisticProjects((prev) => [project, ...prev])
  }

  const allProjects = useMemo(
    () => [...optimisticProjects, ...baseProjects],
    [optimisticProjects, baseProjects],
  )

  return { allProjects, addProject }
}
