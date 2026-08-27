import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllProjects as getStaticProjects } from '../data/projectsData'
import { listProjects } from '../api/projectApi'
import { toDisplayProject } from '../data/mergeProjects'

/**
 * 정적 프로젝트(17개)와 백엔드에 새로 등록된 프로젝트를 병합해서 제공하는 훅.
 *
 * - 정적 프로젝트는 항상 즉시 표시됩니다(백엔드 호출과 무관).
 * - 백엔드 프로젝트는 목록 맨 앞(최신)에 붙습니다. 백엔드 호출이 실패해도
 *   페이지가 깨지지 않고 정적 프로젝트만 보여줍니다.
 */
export default function useProjects() {
  const staticProjects = useMemo(() => getStaticProjects(), [])
  const [backendProjects, setBackendProjects] = useState([])
  const [isLoadingBackend, setIsLoadingBackend] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoadingBackend(true)
    try {
      const list = await listProjects()
      setBackendProjects((Array.isArray(list) ? list : []).map(toDisplayProject))
    } catch (err) {
      console.error('백엔드 프로젝트 목록을 불러오지 못했습니다.', err)
      setBackendProjects([])
    } finally {
      setIsLoadingBackend(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const allProjects = useMemo(
    () => [...backendProjects, ...staticProjects],
    [backendProjects, staticProjects],
  )

  return { allProjects, isLoadingBackend, refetch }
}
