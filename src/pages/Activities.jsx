import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import MagazineEditorModal from '../components/MagazineEditorModal'
import { getMagazine } from '../api/magazineApi'
import noiseTexture from '../assets/activities/noise-texture-activities-tile.webp'
import dottedCircle from '../assets/activities/Rectangle.webp'
import cardOt from '../assets/activities/활동소개아이콘1.webp'
import cardProject from '../assets/activities/활동소개아이콘2.webp'
import cardHackathon from '../assets/activities/활통소개아이콘3.webp'
import cardIdeathon from '../assets/activities/활동소개아이콘4.webp'
import { loadFonts } from '../utils/fonts'

const GENERATIONS = [14, 13]
const ACTIVITY_TYPES = { ot: 'OT', ideathon: 'IDEATHON', hackathon: 'HACKATHON' }
const activityCards = [
  { id: 'ot', title: 'OT', description: '멋쟁이사자처럼으로\n함께하는 첫 걸음!', image: cardOt, width: 270, height: 271 },
  { id: 'ideathon', title: '아이디어톤', description: '5주간 특정 주제에 맞춰,\n무한한 아이디어를 나누는 행사입니다.', image: cardIdeathon, width: 268, height: 268 },
  { id: 'hackathon', title: '해커톤', description: '8주간 멋쟁이사자처럼과 함께\n진행하는 대규모 무박 2일 해커톤 행사', image: cardHackathon, width: 266, height: 266 },
  { id: 'project', title: '프로젝트', description: '기획부터 구현까지\n작업 과정을 배우는 중요한 활동', image: cardProject, width: 310, height: 310 },
]

function MagazineContent({ magazine }) {
  const blocks = Array.isArray(magazine.blocks) ? magazine.blocks : []
  return <article className='py-8 md:py-10'>
    <h2 className='text-2xl font-semibold md:text-4xl'>{magazine.title}</h2>
    {blocks.length === 0 ? <p className='mt-6 text-white/70'>등록된 본문이 없습니다.</p> : <div className='mt-7 space-y-6 md:mt-10 md:space-y-8'>
      {blocks.map((block, index) => {
        if (block.type === 'image') return <figure key={block.id || `image-${index}`} className={block.width === 'half' ? 'w-full md:w-1/2' : 'w-full'}>
          <img src={block.url} alt={block.caption || ''} loading='lazy' decoding='async' className='w-full rounded-xl object-cover' />
          {block.caption && <figcaption className='mt-2 text-sm text-white/65'>{block.caption}</figcaption>}
        </figure>
        return block.style === 'heading'
          ? <h3 key={block.id || `heading-${index}`} className='text-xl font-semibold leading-relaxed md:text-3xl'>{block.text}</h3>
          : <p key={block.id || `text-${index}`} className='whitespace-pre-wrap text-base leading-relaxed text-white/90 md:text-lg'>{block.text}</p>
      })}
    </div>}
  </article>
}

export default function Activities() {
  const navigate = useNavigate()
  const [selectedActivity, setSelectedActivity] = useState('hackathon')
  const [selectedGeneration, setSelectedGeneration] = useState(14)
  // null이면 닫힘, 'create'는 새 매거진, 'edit'은 현재 보고 있는 매거진 수정.
  const [editorMode, setEditorMode] = useState(null)
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => { loadFonts() }, [])

  // magazines.json은 빌드에 함께 커밋된 정적 데이터이므로 동기적으로 조회한다.
  const magazine = useMemo(
    () => getMagazine(ACTIVITY_TYPES[selectedActivity], selectedGeneration),
    [selectedActivity, selectedGeneration],
  )

  const selectCard = (cardId) => {
    if (cardId === 'project') { navigate('/projectshome'); return }
    setSelectedActivity(cardId); setSelectedGeneration(14)
  }
  const selectGeneration = (generation) => {
    setSelectedGeneration(generation)
  }
  const handleCardKeyDown = (event, cardId) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCard(cardId) }
  }
  const openEditor = (mode) => { setSavedNotice(''); setEditorMode(mode) }
  const handleSaved = ({ activityType, generation }) => {
    const activityId = Object.entries(ACTIVITY_TYPES).find(([, type]) => type === activityType)?.[0]
    if (activityId) setSelectedActivity(activityId)
    setSelectedGeneration(generation)
    setEditorMode(null)
    setSavedNotice('저장되었습니다. 배포가 반영되기까지 1분 정도 걸릴 수 있습니다.')
  }

  return <div className='relative flex min-h-screen flex-col overflow-x-hidden text-white' style={{ backgroundColor: '#111315', fontFamily: 'Space Grotesk' }}>
    <div className='pointer-events-none absolute inset-0 z-[1] opacity-[0.82]' style={{ backgroundImage: `url(${noiseTexture})`, backgroundRepeat: 'repeat', backgroundSize: '512px 512px', backgroundPosition: 'top center' }} />
    <Header />
    <main className='relative z-10 flex-1 overflow-x-hidden px-4 pb-12 pt-28 md:px-6 md:pt-36 lg:pt-20'>
      <section className='relative mx-auto max-w-[1360px] overflow-x-hidden'>
        <img src={dottedCircle} alt='' width='1445' height='1114' loading='eager' decoding='async' className='pointer-events-none absolute left-1/2 top-[28%] w-[860px] max-w-[72vw] -translate-x-1/2 -translate-y-1/2 opacity-85' />
        <h1 className='text-center text-[14px] font-semibold tracking-tight md:text-[20px]'>광운대 멋쟁이사자처럼의 활동을 소개합니다.</h1>
        <div className='mt-10 grid grid-cols-1 gap-[30px] sm:grid-cols-2 sm:gap-5 lg:mt-8 lg:grid-cols-4 lg:gap-0.5'>
          {activityCards.map((card) => {
            const selected = card.id === selectedActivity
            return <article key={card.id} role='button' tabIndex={0} onClick={() => selectCard(card.id)} onKeyDown={(event) => handleCardKeyDown(event, card.id)} className={`group relative mx-auto flex h-[136px] w-full max-w-[268px] cursor-pointer flex-row items-center gap-4 overflow-hidden rounded-[16px] border bg-white/[0.22] px-5 py-4 transition sm:h-[500px] sm:flex-col sm:items-center sm:rounded-[30px] sm:px-6 sm:pb-8 sm:pt-10 lg:h-[420px] lg:max-w-[276px] ${selected ? 'border-orange-300 shadow-[0_0_20px_rgba(255,153,102,0.3)]' : 'border-white/85'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300`} aria-label={card.id === 'project' ? '프로젝트 페이지로 이동' : `${card.title} 매거진 보기`}>
              <span aria-hidden='true' className='activity-card-shine pointer-events-none absolute inset-y-[-20%] left-0 z-10 w-[35%] bg-gradient-to-r from-transparent via-white/45 to-transparent' />
              <div className='flex h-[82px] w-[82px] shrink-0 items-center justify-center sm:h-[220px] sm:w-full'><img src={card.image} alt='' width={card.width} height={card.height} loading='eager' decoding='async' className='w-full object-contain sm:w-[85%]' /></div>
              <div className='flex-1 sm:mt-auto sm:w-full sm:flex-none sm:-translate-y-[50px]'><h2 className='text-left text-[18px] font-normal leading-[1.1] sm:flex sm:h-[76px] sm:items-end sm:justify-center sm:text-center sm:text-[26px] sm:font-semibold lg:text-[24px]'>{card.title}</h2><p className='mt-2 whitespace-pre-line text-left text-[12px] font-normal leading-[1.28] text-white/95 sm:mt-4 sm:min-h-[116px] sm:text-center sm:text-[16px] sm:font-medium sm:leading-[1.28] lg:text-[14px]'>{card.description}</p></div>
            </article>
          })}
        </div>
        <section className='relative mt-12 pb-6 md:mt-16' aria-label='활동 매거진'>
          <div className='flex items-center justify-between gap-4'><div className='flex gap-2'>{GENERATIONS.map((generation) => {
            const active = generation === selectedGeneration
            return <button key={generation} type='button' onClick={() => selectGeneration(generation)} className={`inline-flex h-10 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${active ? 'border-orange-300 bg-white text-orange-500 shadow-[0_0_16px_rgba(255,153,102,0.35)]' : 'border-white/35 bg-transparent text-white hover:border-white/70'}`}>{generation}th</button>
          })}</div><div className='flex flex-col items-end gap-0.5'>
            <button type='button' onClick={() => openEditor('create')} className='inline-flex h-8 items-center rounded-full px-2 text-sm font-medium text-white/40 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60' aria-label='매거진 등록'>+ 등록</button>
            {magazine && <button type='button' onClick={() => openEditor('edit')} className='inline-flex h-8 items-center rounded-full px-2 text-sm font-medium text-white/40 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60' aria-label='현재 매거진 수정'>수정</button>}
          </div></div>
          <div className='mt-5 border-t border-white/25' />
          {savedNotice && <div role='status' className='mt-5 rounded-lg border border-orange-300/60 bg-orange-300/10 px-4 py-3 text-sm text-orange-200'>{savedNotice}</div>}
          {!magazine && <div className='py-12 text-center text-white/65'>등록된 매거진이 없습니다.</div>}
          {magazine && <MagazineContent magazine={magazine} />}
        </section>
      </section>
    </main>
    <div className='relative z-20 w-full px-4 pb-3'><Footer /></div>
    {editorMode && <MagazineEditorModal initialActivity={ACTIVITY_TYPES[selectedActivity]} initialGeneration={selectedGeneration} initialMagazine={editorMode === 'edit' ? magazine : null} onClose={() => setEditorMode(null)} onSaved={handleSaved} />}
  </div>
}
