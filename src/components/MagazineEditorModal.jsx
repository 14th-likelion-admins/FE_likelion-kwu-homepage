import { Fragment, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { deleteMagazine, saveMagazine, uploadImage } from '../api/magazineApi'
import {
  MAX_COLUMNS,
  appendItemToRow,
  createImageItem,
  createRow,
  createTextItem,
  insertRowAfter,
  mergeItemIntoNeighborRow,
  moveItemToNewRow,
  moveItemToRow,
  removeItem,
  shiftItemWithinRow,
  toRows,
  updateItem,
} from '../utils/magazineBlocks'

const ACTIVITY_OPTIONS = [
  { value: 'OT', label: 'OT' },
  { value: 'IDEATHON', label: '아이디어톤' },
  { value: 'HACKATHON', label: '해커톤' },
]

/** 행 사이 여백. 여기에 떨어뜨리면 그 위치에 새 줄이 생긴다. */
function RowGap({ index, dragging }) {
  const { setNodeRef, isOver } = useDroppable({ id: `gap:${index}` })
  return <div
    ref={setNodeRef}
    aria-hidden='true'
    className={`rounded transition-all ${dragging ? 'my-1 h-9' : 'h-3'} ${isOver ? 'bg-orange-300/30 outline-dashed outline-1 outline-orange-300' : ''}`}
  />
}

/** 행 안 열 사이 경계. 여기에 떨어뜨리면 그 자리 칸으로 들어간다. */
function ColumnEdge({ rowId, index, dragging, disabled }) {
  const { setNodeRef, isOver } = useDroppable({ id: `edge:${rowId}:${index}`, disabled })
  return <div
    ref={setNodeRef}
    aria-hidden='true'
    className={`shrink-0 self-stretch rounded transition-all ${dragging && !disabled ? 'w-6' : 'w-1'} ${isOver ? 'bg-orange-300/30 outline-dashed outline-1 outline-orange-300' : ''}`}
  />
}

function ItemCard({ item, row, rowIndex, rowCount, uploadingId, actions }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id })
  const itemIndex = row.items.findIndex((entry) => entry.id === item.id)
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 40 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative min-w-0 flex-1 rounded-xl border border-white/20 bg-black/15 p-4 ${isDragging ? 'opacity-60 shadow-2xl' : ''}`}
    >
      <div className='mb-3 flex flex-wrap items-center justify-between gap-2 text-sm'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            {...attributes}
            {...listeners}
            className='cursor-grab rounded px-1.5 py-1 text-white/50 hover:bg-white/10 hover:text-white active:cursor-grabbing'
            aria-label={`${item.type === 'text' ? '텍스트' : '이미지'} 블록 끌어 옮기기`}
            title='끌어서 위치 옮기기'
          >⠿</button>
          <span className='text-white/65'>{item.type === 'text' ? '텍스트' : '이미지'}</span>
        </div>
        <div className='flex gap-1'>
          <button type='button' onClick={() => actions.shift(item.id, -1)} disabled={itemIndex === 0} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='같은 줄에서 왼쪽으로' title='같은 줄에서 왼쪽으로'>←</button>
          <button type='button' onClick={() => actions.shift(item.id, 1)} disabled={itemIndex === row.items.length - 1} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='같은 줄에서 오른쪽으로' title='같은 줄에서 오른쪽으로'>→</button>
          <button type='button' onClick={() => actions.toRow(item.id, rowIndex)} disabled={rowIndex === 0 && row.items.length === 1} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='윗줄로 빼내기' title='윗줄로 빼내기'>↑</button>
          <button type='button' onClick={() => actions.toRow(item.id, rowIndex + 2)} disabled={rowIndex === rowCount - 1 && row.items.length === 1} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='아랫줄로 빼내기' title='아랫줄로 빼내기'>↓</button>
          <button type='button' onClick={() => actions.merge(item.id, -1)} disabled={rowIndex === 0} className='rounded px-2 py-1 hover:bg-white/10 disabled:opacity-30' aria-label='윗줄 옆칸으로 붙이기' title='윗줄 옆칸으로 붙이기'>⇱</button>
          <button type='button' onClick={() => actions.remove(item.id)} className='rounded px-2 py-1 text-red-300 hover:bg-white/10' aria-label='블록 삭제'>삭제</button>
        </div>
      </div>

      {item.type === 'text' ? (
        <>
          <select value={item.style} onChange={(event) => actions.update(item.id, { style: event.target.value })} className='mb-3 rounded border border-white/25 bg-[#191c20] px-2 py-1 text-sm'>
            <option value='paragraph'>문단</option><option value='heading'>제목</option>
          </select>
          <textarea value={item.text} onChange={(event) => actions.update(item.id, { text: event.target.value })} placeholder='내용을 입력하세요. 마크다운을 쓸 수 있어요: **굵게**, *기울임*, [링크](https://...), - 목록' rows='4' className='w-full resize-y rounded-lg border border-white/25 bg-white/10 p-3 text-white placeholder:text-white/40' />
        </>
      ) : (
        <div className='space-y-3'>
          <input type='file' accept='image/*' onChange={(event) => actions.selectImage(item.id, event.target.files?.[0], event.target)} disabled={uploadingId === item.id} className='block w-full text-sm text-white/75 file:mr-3 file:rounded file:border-0 file:bg-orange-300 file:px-3 file:py-1 file:text-[#111315]' />
          {uploadingId === item.id && <p className='text-sm text-orange-200'>이미지를 업로드하고 있습니다…</p>}
          {item.uploadError && <p role='alert' className='text-sm text-red-300'>{item.uploadError}</p>}
          {!item.url && item.file && uploadingId !== item.id && !item.uploadError && <p className='text-sm text-white/60'>저장할 때 함께 업로드됩니다.</p>}
          {/*
            방금 올린 이미지는 커밋만 됐을 뿐 아직 배포 전이라 원격 URL이 404다.
            그 URL을 미리보기로 요청하면 브라우저가 SPA 폴백 HTML을 이미지 자리에
            캐시해 버리므로, 로컬 objectURL이 있으면 그쪽을 먼저 쓴다.
          */}
          {(item.previewUrl || item.url) && <img src={item.previewUrl || item.url} alt='업로드 미리보기' loading='lazy' decoding='async' className='max-h-56 rounded-lg object-contain' />}
          <input value={item.caption} onChange={(event) => actions.update(item.id, { caption: event.target.value })} placeholder='이미지 설명 (선택)' className='w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-white placeholder:text-white/40' />
          {row.items.length === 1 && <select value={item.width} onChange={(event) => actions.update(item.id, { width: event.target.value })} className='rounded border border-white/25 bg-[#191c20] px-2 py-1 text-sm'>
            <option value='full'>전체 너비</option><option value='half'>반 너비</option>
          </select>}
        </div>
      )}

      <div className='mt-4 flex gap-2 border-t border-white/10 pt-3'>
        <button type='button' onClick={() => actions.addRowAfter(rowIndex, createTextItem())} className='rounded-md border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10'>+ 텍스트</button>
        <button type='button' onClick={() => actions.addRowAfter(rowIndex, createImageItem())} className='rounded-md border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10'>+ 이미지</button>
      </div>
    </div>
  )
}

export default function MagazineEditorModal({ initialActivity, initialGeneration, initialMagazine, onClose, onSaved, onDeleted }) {
  const isEditing = Boolean(initialMagazine)
  const [activityType, setActivityType] = useState(initialActivity)
  const [generation, setGeneration] = useState(initialGeneration)
  const [title, setTitle] = useState(initialMagazine?.title ?? '')
  const [rows, setRows] = useState(() => {
    const normalized = toRows(initialMagazine?.blocks)
    return normalized.length > 0 ? normalized : [createRow([createTextItem()])]
  })
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState('')

  // 카드 안에 입력 요소가 많아서, 살짝 끌어야 드래그로 인식하도록 문턱을 둔다.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  // 수정 중에 대상을 옮기면 원본이 남은 채 새 항목이 생기므로 미리 알린다.
  const movedTarget = isEditing
    && (activityType !== initialActivity || Number(generation) !== Number(initialGeneration))

  const uploadMessage = (uploadError) => (uploadError.status === 401
    ? '운영진 암호가 올바르지 않습니다.'
    : uploadError.message || '이미지 업로드에 실패했습니다.')

  const uploadItemImage = async (itemId, file) => {
    setUploadingId(itemId)
    try {
      // 픽셀 크기는 렌더러가 <img width height>로 쓴다. 레이아웃 폭인 width('full'|'half')와
      // 헷갈리지 않도록 pixelWidth/pixelHeight로 따로 담는다.
      const { url, width, height } = await uploadImage(file, 'magazines', passphrase)
      setRows((current) => updateItem(current, itemId, { url, pixelWidth: width, pixelHeight: height, uploadError: '' }))
      return { url, width, height }
    } catch (uploadError) {
      setRows((current) => updateItem(current, itemId, { uploadError: uploadMessage(uploadError) }))
      throw uploadError
    } finally {
      setUploadingId(null)
    }
  }

  /**
   * 파일을 고른 시점에 암호가 없으면 항목이 File을 들고만 있다가 저장할 때 올린다.
   * 입력 순서 때문에 업로드가 막히지 않게 하는 장치다.
   */
  const selectImage = (itemId, file, input) => {
    if (input) input.value = ''
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setRows((current) => current.map((row) => ({
      ...row,
      items: row.items.map((item) => {
        if (item.id !== itemId) return item
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
        return { ...item, file, previewUrl, url: '', uploadError: '' }
      }),
    })))
    if (passphrase.trim()) uploadItemImage(itemId, file).catch(() => {})
  }

  /**
   * 암호가 틀려 업로드가 실패하면 블록에 오류가 남는데, 암호를 고쳐도 그 문구가
   * 그대로 붙어 있어 계속 틀린 것처럼 보였다. 암호를 건드리면 지난 실패를 지운다.
   */
  const changePassphrase = (value) => {
    setPassphrase(value)
    setError('')
    setRows((current) => current.map((row) => ({
      ...row,
      items: row.items.map((item) => (item.uploadError ? { ...item, uploadError: '' } : item)),
    })))
  }

  const actions = {
    update: (itemId, updates) => setRows((current) => updateItem(current, itemId, updates)),
    remove: (itemId) => setRows((current) => removeItem(current, itemId)),
    shift: (itemId, direction) => setRows((current) => shiftItemWithinRow(current, itemId, direction)),
    toRow: (itemId, gapIndex) => setRows((current) => moveItemToNewRow(current, itemId, gapIndex)),
    merge: (itemId, direction) => setRows((current) => mergeItemIntoNeighborRow(current, itemId, direction)),
    addRowAfter: (rowIndex, item) => setRows((current) => insertRowAfter(current, rowIndex, item)),
    selectImage,
  }

  const handleDragEnd = ({ active, over }) => {
    setDraggingId(null)
    if (!over) return
    const [kind, first, second] = String(over.id).split(':')
    if (kind === 'gap') setRows((current) => moveItemToNewRow(current, active.id, Number(first)))
    if (kind === 'edge') setRows((current) => moveItemToRow(current, active.id, first, Number(second)))
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
    const items = rows.flatMap((row) => row.items)
    if (items.length === 0) {
      setError('본문 블록을 하나 이상 추가해 주세요.')
      return
    }
    if (items.some((item) => item.type === 'image' && !item.url && !item.file)) {
      setError('이미지 블록의 파일을 선택해 주세요.')
      return
    }

    setSaving(true)
    setError('')
    try {
      // 암호를 파일 선택보다 나중에 입력했거나 앞선 업로드가 실패한 이미지를 여기서 올린다.
      const uploaded = new Map()
      for (const item of items) {
        if (item.type === 'image' && !item.url && item.file) {
          uploaded.set(item.id, await uploadItemImage(item.id, item.file))
        }
      }

      // File·objectURL·업로드 오류는 편집 중에만 쓰는 값이라, 저장할 필드만 골라 담는다.
      const blocks = rows.map((row) => ({
        id: row.id,
        type: 'row',
        items: row.items.map((item) => {
          if (item.type !== 'image') return { id: item.id, type: 'text', text: item.text, style: item.style }
          const fresh = uploaded.get(item.id)
          return {
            id: item.id,
            type: 'image',
            url: fresh?.url ?? item.url,
            caption: item.caption,
            width: item.width,
            pixelWidth: fresh?.width ?? item.pixelWidth ?? null,
            pixelHeight: fresh?.height ?? item.pixelHeight ?? null,
          }
        }),
      }))

      await saveMagazine(activityType, Number(generation), { title: title.trim(), blocks }, passphrase)
      onSaved({ activityType, generation: Number(generation) })
    } catch (saveError) {
      setError(saveError.status === 401 ? '운영진 암호가 올바르지 않습니다.' : saveError.message || '매거진 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  /** 폼에서 활동·기수를 바꿨더라도, 지우는 대상은 열 때의 그 매거진이다. */
  const handleDelete = async () => {
    if (!passphrase.trim()) {
      setError('운영진 암호를 입력해 주세요.')
      return
    }
    setDeleting(true)
    setError('')
    try {
      await deleteMagazine(initialActivity, Number(initialGeneration), passphrase)
      onDeleted({ activityType: initialActivity, generation: Number(initialGeneration) })
    } catch (deleteError) {
      setError(deleteError.status === 401 ? '운영진 암호가 올바르지 않습니다.' : deleteError.message || '매거진 삭제에 실패했습니다.')
      setConfirmingDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  const busy = saving || deleting || uploadingId !== null
  const dragging = Boolean(draggingId)
  // 한/영 전환을 깜빡하고 친 경우를 바로 알아채도록 한다. 완성형·자모·호환자모 모두 잡는다.
  const hasHangul = /[ᄀ-ᇿ㄰-㆏가-힯]/.test(passphrase)

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4' role='dialog' aria-modal='true' aria-labelledby='magazine-editor-title'>
      <div className='max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/20 bg-[#191c20] p-5 text-white shadow-2xl md:p-8'>
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

        {/*
          type='password'를 쓰면 로그인 폼이 아니어도 Chrome이 비밀번호 저장을 제안한다.
          운영진끼리 공유하는 값이라 브라우저 자격증명으로 저장될 이유가 없어,
          텍스트 입력에 -webkit-text-security로 가리고 보기 토글을 붙였다.
          값이 있을 때만 가려서 placeholder는 그대로 읽히게 한다.
        */}
        <label className='mt-4 block text-sm'>운영진 암호
          <div className='relative mt-2'>
            <input
              type='text'
              value={passphrase}
              onChange={(event) => changePassphrase(event.target.value)}
              placeholder='운영진끼리 공유한 암호'
              name='content-write-key'
              autoComplete='off'
              autoCorrect='off'
              autoCapitalize='off'
              spellCheck='false'
              data-lpignore='true'
              data-1p-ignore=''
              data-form-type='other'
              className={`w-full rounded-lg border border-white/25 bg-white/10 px-3 py-2 pr-16 text-white placeholder:text-white/40 ${!showPassphrase && passphrase ? '[-webkit-text-security:disc]' : ''}`}
            />
            <button type='button' onClick={() => setShowPassphrase((current) => !current)} className='absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white'>
              {showPassphrase ? '숨기기' : '보기'}
            </button>
          </div>
        </label>
        {hasHangul && <p className='mt-2 text-sm text-orange-200'>암호에 한글이 섞여 있습니다. 한/영 키를 확인해 주세요.</p>}

        <p className='mt-6 text-sm text-white/55'>
          ⠿ 손잡이를 끌어 옮깁니다. 블록 <span className='text-white/80'>옆</span>에 놓으면 같은 줄에 나란히, 줄 <span className='text-white/80'>사이</span>에 놓으면 새 줄이 됩니다.
          한 줄에 최대 {MAX_COLUMNS}칸이며, 좁은 화면에서는 자동으로 세로로 쌓입니다.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setDraggingId(active.id)}
          onDragCancel={() => setDraggingId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className='mt-3'>
            <RowGap index={0} dragging={dragging} />
            {rows.map((row, rowIndex) => {
              // 끌고 있는 블록이 이 줄에서 나온 것이면, 칸이 하나 비므로 가득 찬 것으로 보지 않는다.
              const fromThisRow = dragging && row.items.some((item) => item.id === draggingId)
              const full = row.items.length >= MAX_COLUMNS && !fromThisRow
              return <Fragment key={row.id}>
                <div className='flex items-stretch'>
                  <ColumnEdge rowId={row.id} index={0} dragging={dragging} disabled={full} />
                  {row.items.map((item, itemIndex) => <Fragment key={item.id}>
                    <ItemCard item={item} row={row} rowIndex={rowIndex} rowCount={rows.length} uploadingId={uploadingId} actions={actions} />
                    <ColumnEdge rowId={row.id} index={itemIndex + 1} dragging={dragging} disabled={full} />
                  </Fragment>)}
                  {row.items.length < MAX_COLUMNS && !dragging && <button type='button' onClick={() => setRows((current) => appendItemToRow(current, row.id, createTextItem()))} className='ml-1 shrink-0 rounded-xl border border-dashed border-white/25 px-3 text-sm text-white/45 transition hover:border-white/50 hover:text-white' title='이 줄에 칸 추가'>+ 칸</button>}
                </div>
                <RowGap index={rowIndex + 1} dragging={dragging} />
              </Fragment>
            })}
          </div>
        </DndContext>

        {rows.length === 0 && <button type='button' onClick={() => setRows([createRow([createTextItem()])])} className='rounded-md border border-dashed border-white/35 px-3 py-2 text-sm hover:bg-white/10'>+ 첫 블록 추가</button>}

        {error && <p role='alert' className='mt-4 text-sm text-red-300'>{error}</p>}
        <div className='mt-7 flex justify-end gap-3'>
          <button type='button' onClick={onClose} className='rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10'>취소</button>
          <button type='button' onClick={handleSave} disabled={busy} className='rounded-lg bg-orange-300 px-4 py-2 text-sm font-semibold text-[#111315] hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-60'>{saving ? '저장 중…' : '저장'}</button>
        </div>

        {isEditing && <div className='mt-8 border-t border-white/10 pt-5'>
          {confirmingDelete ? <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-red-200'>{initialActivity} {initialGeneration}기 매거진을 삭제합니다. 되돌릴 수 없습니다.</p>
            <div className='flex gap-2'>
              <button type='button' onClick={() => setConfirmingDelete(false)} disabled={deleting} className='rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50'>취소</button>
              <button type='button' onClick={handleDelete} disabled={busy} className='rounded-lg bg-red-500/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60'>{deleting ? '삭제 중…' : '삭제 확인'}</button>
            </div>
          </div> : <button type='button' onClick={() => setConfirmingDelete(true)} className='text-sm text-red-300/80 transition hover:text-red-300'>이 매거진 삭제</button>}
        </div>}
      </div>
    </div>
  )
}
