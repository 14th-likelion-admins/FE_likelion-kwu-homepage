import { useState } from 'react'
import { saveMagazine, uploadImage } from '../api/magazineApi'

const ACTIVITY_OPTIONS = [
  { value: 'OT', label: 'OT' },
  { value: 'IDEATHON', label: '아이디어톤' },
  { value: 'HACKATHON', label: '해커톤' },
]

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createTextBlock = () => ({ id: createId(), type: 'text', text: '', style: 'paragraph' })
const createImageBlock = () => ({ id: createId(), type: 'image', url: '', caption: '', width: 'full' })

/**
 * 저장된 매거진 블록에는 편집용 id가 없을 수 있으므로 채워 넣고,
 * 누락된 필드는 기본값으로 메워 제어 컴포넌트가 깨지지 않게 한다.
 */
const hydrateBlocks = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) return [createTextBlock()]
  return blocks.map((block) => (block.type === 'image'
    ? { ...block, id: block.id || createId(), url: block.url ?? '', caption: block.caption ?? '', width: block.width ?? 'full' }
    : { ...block, id: block.id || createId(), type: 'text', text: block.text ?? '', style: block.style ?? 'paragraph' }))
}

export default function MagazineEditorModal({ initialActivity, initialGeneration, initialMagazine, onClose, onSaved }) {
  const isEditing = Boolean(initialMagazine)
  const [activityType, setActivityType] = useState(initialActivity)
  const [generation, setGeneration] = useState(initialGeneration)
  const [title, setTitle] = useState(initialMagazine?.title ?? '')
  const [blocks, setBlocks] = useState(() => hydrateBlocks(initialMagazine?.blocks))
  const [passphrase, setPassphrase] = useState('')
  const [uploadingId, setUploadingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 수정 중에 대상을 옮기면 원본이 남은 채 새 항목이 생기므로 미리 알린다.
  const movedTarget = isEditing
    && (activityType !== initialActivity || Number(generation) !== Number(initialGeneration))

  const updateBlock = (id, updates) => {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }

  const insertBlock = (index, block) => {
    setBlocks((current) => [...current.slice(0, index), block, ...current.slice(index)])
  }

  const moveBlock = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= blocks.length) return
    setBlocks((current) => {
      const next = [...current]
      ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
      return next
    })
  }

  const uploadMessage = (uploadError) => (uploadError.status === 401
    ? '운영진 암호가 올바르지 않습니다.'
    : uploadError.message || '이미지 업로드에 실패했습니다.')

  const uploadBlockImage = async (blockId, file) => {
    setUploadingId(blockId)
    try {
      const url = await uploadImage(file, 'magazines', passphrase)
      updateBlock(blockId, { url, uploadError: '' })
      return url
    } catch (uploadError) {
      updateBlock(blockId, { uploadError: uploadMessage(uploadError) })
      throw uploadError
    } finally {
      setUploadingId(null)
    }
  }

  /**
   * 파일을 고른 시점에 암호가 없으면 블록에 들고만 있다가 저장할 때 올린다.
   * 예전에는 여기서 곧장 거절해서, 암호를 나중에 입력하면 파일이 붙은 것처럼
   * 보이는데도 저장이 막히고 같은 파일은 재선택해도 change 이벤트가 없어
   * 되돌릴 방법이 없었다.
   */
  const handleImageSelect = (blockId, file, input) => {
    if (input) input.value = ''
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setBlocks((current) => current.map((block) => {
      if (block.id !== blockId) return block
      if (block.previewUrl) URL.revokeObjectURL(block.previewUrl)
      return { ...block, file, previewUrl, url: '', uploadError: '' }
    }))
    if (passphrase.trim()) uploadBlockImage(blockId, file).catch(() => {})
  }

  const handleSave = async () => {
    if (!title.trim()) {
      setError('매거진 제목을 입력해 주세요.')
      return
    }
    if (!Number.isInteger(Number(generation)) || Number(generation) < 1) {
      setError('올바른 기수를 입력해 주세요.')
      return
    }
    if (!passphrase.trim()) {
      setError('운영진 암호를 입력해 주세요.')
      return
    }
    if (blocks.some((block) => block.type === 'image' && !block.url && !block.file)) {
      setError('이미지 블록의 파일을 선택해 주세요.')
      return
    }

    setSaving(true)
    setError('')
    try {
      // 암호를 파일 선택보다 나중에 입력했거나 앞선 업로드가 실패한 이미지를 여기서 올린다.
      const settled = []
      for (const block of blocks) {
        if (block.type === 'image' && !block.url && block.file) {
          settled.push({ ...block, url: await uploadBlockImage(block.id, block.file) })
        } else {
          settled.push(block)
        }
      }
      setBlocks(settled)

      // File·objectURL·업로드 오류는 편집 중에만 쓰는 값이라, 저장할 필드만 골라 담는다.
      const payload = settled.map((block) => (block.type === 'image'
        ? { id: block.id, type: 'image', url: block.url, caption: block.caption, width: block.width }
        : { id: block.id, type: 'text', text: block.text, style: block.style }))
      await saveMagazine(activityType, Number(generation), { title: title.trim(), blocks: payload }, passphrase)
      onSaved({ activityType, generation: Number(generation) })
    } catch (saveError) {
      setError(saveError.status === 401 ? '운영진 암호가 올바르지 않습니다.' : saveError.message || '매거진 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4' role='dialog' aria-modal='true' aria-labelledby='magazine-editor-title'>
      <div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/20 bg-[#191c20] p-5 text-white shadow-2xl md:p-8'>
        <div className='flex items-center justify-between gap-4'>
          <h2 id='magazine-editor-title' className='text-xl font-semibold md:text-2xl'>{isEditing ? '매거진 수정' : '매거진 등록'}</h2>
          <button type='button' onClick={onClose} className='text-2xl text-white/70 hover:text-white' aria-label='모달 닫기'>×</button>
        </div>

        <div className='mt-6 grid gap-4 sm:grid-cols-2'>
          <label className='text-sm'>활동
            <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className='mt-2 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white'>
              {ACTIVITY_OPTIONS.map((option) => <option key={option.value} value={option.value} className='bg-[#191c20]'>{option.label}</option>)}
            </select>
          </label>
          <label className='text-sm'>기수
            <input type='number' min='1' value={generation} onChange={(event) => setGeneration(event.target.value)} className='mt-2 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white' />
          </label>
        </div>

        {movedTarget && <p className='mt-3 text-sm text-orange-200'>활동이나 기수를 바꾸면 원래 매거진은 그대로 남고, 새 매거진으로 등록됩니다.</p>}

        <label className='mt-4 block text-sm'>제목
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder='매거진 제목' className='mt-2 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/40' />
        </label>

        <label className='mt-4 block text-sm'>운영진 암호
          <input type='password' value={passphrase} onChange={(event) => setPassphrase(event.target.value)} placeholder='운영진끼리 공유한 암호' className='mt-2 w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/40' />
        </label>

        <div className='mt-7 space-y-4'>
          {blocks.map((block, index) => (
            <div key={block.id} className='rounded-xl border border-white/20 bg-black/15 p-4'>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-2 text-sm'>
                <span className='text-white/65'>{block.type === 'text' ? '텍스트 블록' : '이미지 블록'}</span>
                <div className='flex gap-1'>
                  <button type='button' onClick={() => moveBlock(index, -1)} disabled={index === 0} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='위로 이동'>↑</button>
                  <button type='button' onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='아래로 이동'>↓</button>
                  <button type='button' onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} className='rounded px-2 py-1 text-red-300 hover:bg-white/10' aria-label='블록 삭제'>삭제</button>
                </div>
              </div>
              {block.type === 'text' ? (
                <>
                  <select value={block.style} onChange={(event) => updateBlock(block.id, { style: event.target.value })} className='mb-3 rounded border border-white/25 bg-[#191c20] px-2 py-1 text-sm'>
                    <option value='paragraph'>문단</option><option value='heading'>제목</option>
                  </select>
                  <textarea value={block.text} onChange={(event) => updateBlock(block.id, { text: event.target.value })} placeholder='내용을 입력하세요.' rows='4' className='w-full resize-y rounded-lg border border-white/25 bg-white/10 p-3 text-white placeholder:text-white/40' />
                </>
              ) : (
                <div className='space-y-3'>
                  <input type='file' accept='image/*' onChange={(event) => handleImageSelect(block.id, event.target.files?.[0], event.target)} disabled={uploadingId === block.id} className='block w-full text-sm text-white/75 file:mr-3 file:rounded file:border-0 file:bg-orange-300 file:px-3 file:py-1 file:text-[#111315]' />
                  {uploadingId === block.id && <p className='text-sm text-orange-200'>이미지를 업로드하고 있습니다…</p>}
                  {block.uploadError && <p role='alert' className='text-sm text-red-300'>{block.uploadError}</p>}
                  {!block.url && block.file && uploadingId !== block.id && !block.uploadError && <p className='text-sm text-white/60'>저장할 때 함께 업로드됩니다.</p>}
                  {(block.url || block.previewUrl) && <img src={block.url || block.previewUrl} alt='업로드 미리보기' loading='lazy' decoding='async' className='max-h-56 rounded-lg object-contain' />}
                  <input value={block.caption} onChange={(event) => updateBlock(block.id, { caption: event.target.value })} placeholder='이미지 설명 (선택)' className='w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/40' />
                  <select value={block.width} onChange={(event) => updateBlock(block.id, { width: event.target.value })} className='rounded border border-white/25 bg-[#191c20] px-2 py-1 text-sm'><option value='full'>전체 너비</option><option value='half'>반 너비</option></select>
                </div>
              )}
              <div className='mt-4 flex gap-2 border-t border-white/10 pt-3'>
                <button type='button' onClick={() => insertBlock(index + 1, createTextBlock())} className='rounded-md border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10'>+ 텍스트</button>
                <button type='button' onClick={() => insertBlock(index + 1, createImageBlock())} className='rounded-md border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10'>+ 이미지</button>
              </div>
            </div>
          ))}
          {blocks.length === 0 && <button type='button' onClick={() => setBlocks([createTextBlock()])} className='rounded-md border border-dashed border-white/35 px-3 py-2 text-sm hover:bg-white/10'>+ 첫 블록 추가</button>}
        </div>

        {error && <p role='alert' className='mt-4 text-sm text-red-300'>{error}</p>}
        <div className='mt-7 flex justify-end gap-3'>
          <button type='button' onClick={onClose} className='rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10'>취소</button>
          <button type='button' onClick={handleSave} disabled={saving || uploadingId !== null} className='rounded-lg bg-orange-300 px-4 py-2 text-sm font-semibold text-[#111315] hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-60'>{saving ? '저장 중…' : '저장'}</button>
        </div>
      </div>
    </div>
  )
}
