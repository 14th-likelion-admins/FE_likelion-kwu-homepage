// src/App.jsx
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SmoothScroll from './components/SmoothScroll'

const Recruit = lazy(() => import('./pages/Recruit'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const Activities = lazy(() => import('./pages/Activities'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectsHome = lazy(() => import('./pages/ProjectsHome'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <ScrollToTop />
      <Suspense fallback={<div className='min-h-screen bg-[#1A1A1A]' />}>
        <Routes>
          {/* 메인 페이지 */}
          <Route path='/' element={<Home />} />
          <Route path='/activities' element={<Activities />} />
          <Route path='/recruit' element={<Recruit />} />
          <Route path='/curriculum/:track' element={<Curriculum />} />

          {/* 프로젝트 홈 */}
          <Route path='/projectshome' element={<ProjectsHome />} />

          {/* 프로젝트 리스트 */}
          <Route path='/projects' element={<Projects />} />

          {/*그 외 모든 경로 Home */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
