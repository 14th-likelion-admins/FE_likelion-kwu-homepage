// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import logo from '../assets/kw-logo.png'

export default function Header() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const aboutRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navigate = useNavigate()

  const handleProjectClick = (e) => {
    try {
      if (window && window.innerWidth < 768) {
        e.preventDefault()
        navigate('/projects')
      }
    } catch (err) {}
  }

  useEffect(() => {
    const onClickOutside = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setAboutOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
        setMobileAboutOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <>
      <header
        className='fixed top-0 left-0 z-50 w-full backdrop-blur'
        style={{ backgroundColor: '#1A1A1A' }}
      >
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:py-4'>
          <Link to='/' className='flex items-center gap-2'>
            <img src={logo} alt='LIKELION Logo' className='h-7 w-7 md:h-10 md:w-10' />
            <span className='hidden text-lg font-bold md:inline-block md:text-xl'>광운대 멋쟁이사자처럼</span>
          </Link>

          <nav className='hidden items-center gap-6 text-sm md:flex'>
            <div className='relative' ref={aboutRef}>
              <button
                type='button'
                onClick={() => setAboutOpen((prev) => !prev)}
                className='hover:text-orange-400'
              >
                ABOUT
              </button>
              {aboutOpen && (
                <div className='absolute left-0 top-full mt-3 w-28 rounded-md border border-white/20 bg-[#111315]/95 p-2 backdrop-blur'>
                  <Link
                    to='/activities'
                    className='block px-2 py-1 text-sm text-white hover:text-orange-400'
                    onClick={() => setAboutOpen(false)}
                  >
                    주요 활동
                  </Link>
                  <Link
                    to='/curriculum/frontend'
                    className='mt-1 block px-2 py-1 text-sm text-white hover:text-orange-400'
                    onClick={() => setAboutOpen(false)}
                  >
                    커리큘럼
                  </Link>
                </div>
              )}
            </div>
            <Link to='/recruit' className='hover:text-orange-400'>
              RECRUIT
            </Link>
            <Link to='/projectshome' onClick={handleProjectClick} className='hover:text-orange-400'>
              PROJECT
            </Link>
          </nav>

          <div className='relative md:hidden' ref={mobileMenuRef}>
            <button
              type='button'
              onClick={() =>
                setMobileMenuOpen((prev) => {
                  const next = !prev
                  if (!next) {
                    setMobileAboutOpen(false)
                  }
                  return next
                })
              }
              className='inline-flex h-8 w-8 items-center justify-center p-0 leading-none'
              aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {mobileMenuOpen ? (
                <span className='relative block h-5 w-5'>
                  <span className='absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white' />
                  <span className='absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white' />
                </span>
              ) : (
                <span className='flex h-5 w-5 flex-col items-center justify-center gap-[4px]'>
                  <span className='block h-px w-4 bg-white' />
                  <span className='block h-px w-4 bg-white' />
                  <span className='block h-px w-4 bg-white' />
                </span>
              )}
            </button>

            {mobileMenuOpen && (
              <div className='absolute right-0 top-full mt-2 w-44 rounded-md border border-white/20 bg-[#111315]/95 p-2 text-sm backdrop-blur'>
                <button
                  type='button'
                  onClick={() => setMobileAboutOpen((prev) => !prev)}
                  className='flex w-full items-center justify-between px-2 py-2 text-left text-white hover:text-orange-400'
                >
                  <span>ABOUT</span>
                </button>
                {mobileAboutOpen && (
                  <>
                    <Link
                      to='/activities'
                      className='block pl-6 pr-2 py-2 text-white hover:text-orange-400'
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setMobileAboutOpen(false)
                      }}
                    >
                      주요 활동
                    </Link>
                    <Link
                      to='/curriculum/frontend'
                      className='block pl-6 pr-2 py-2 text-white hover:text-orange-400'
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setMobileAboutOpen(false)
                      }}
                    >
                      커리큘럼
                    </Link>
                  </>
                )}
                <Link
                  to='/recruit'
                  className='block px-2 py-2 text-white hover:text-orange-400'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  RECRUIT
                </Link>
                <Link
                  to='/projectshome'
                  onClick={(e) => {
                    handleProjectClick(e)
                    setMobileMenuOpen(false)
                  }}
                  className='block px-2 py-2 text-white hover:text-orange-400'
                >
                  PROJECT
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
