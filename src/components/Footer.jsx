// src/components/Footer.jsx
import email from '../assets/email-icon.webp'
import insta from '../assets/insta-icon.webp'
import { LINKS } from '../utils/links'

export default function Footer() {
  return (
    <footer className='py-4'>
      <div className='relative flex flex-col items-center justify-between gap-4 px-4 mx-auto max-w-7xl md:flex-row'>
        <p className='text-sm font-bold text-white'>광운대 멋쟁이사자처럼</p>
        <p className='text-sm text-center text-white md:absolute md:left-1/2 md:transform md:-translate-x-1/2'>
          © 2026 LIKELION KWUNIV
        </p>

        <div className='flex items-center gap-6 text-sm text-white md:ml-auto'>
          <a href={`mailto:${LINKS.EMAIL}`} className='transition hover:text-orange-400'>
            Contact us!
          </a>
          <a href={`mailto:${LINKS.EMAIL}`} aria-label={`Send email to ${LINKS.EMAIL}`}>
            <img src={email} alt='email' className='w-8 md:w-8' />
          </a>
          <a
            href={LINKS.INSTAGRAM}
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Visit likelion_kwangwoon Instagram'
          >
            <img src={insta} alt='instagram' className='w-6 h-6 md:w-6 md:h-6' />
          </a>
        </div>
      </div>
    </footer>
  )
}
