import { useEffect, useState } from 'react'
import { registerProject, uploadImage } from '../api/projectApi'

const TAG_OPTIONS = ['WEB', 'APP']
const GENERATION_OPTIONS = ['14TH', '13TH']
const ACTIVITY_OPTIONS = ['아이디어톤', '중앙해커톤', '권역별 연합해커톤']
const MAX_IMAGES = 10

const createLocalId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(16).slice(2)}`)

const inputClassName =
  'w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-white/60 focus:outline-none'

// 네이티브 select 화살표를 숨기고 커스텀 화살표를 기본 위치보다 20px 왼쪽에 그려서 사용
function SelectField({ value, onChange, options }) {
  return (
    <div className='relative'>
      <select
        className={`${inputClassName} appearance-none pr-12`}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option} value={option} style={{ backgroundColor: '#e5e7eb', color: '#111827' }}>
            {option}
          </option>
        ))}
      </select>
      <svg
        className='pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-white/60'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
      >
        <path
          d='M6 9L12 15L18 9'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
}

export default function ProjectFormModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('WEB')
  const [description, setDescription] = useState('')
  const [generation, setGeneration] = useState(GENERATION_OPTIONS[0])
  const [activity, setActivity] = useState(ACTIVITY_OPTIONS[0])
  const [overview, setOverview] = useState('')
  const [features, setFeatures] = useState([''])
  const [images, setImages] = useState([])
  const [passphrase, setPassphrase] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 모달이 다시 열릴 때 이전 입력을 초기화
  useEffect(() => {
    if (!isOpen) return
    setTitle('')
    setTag('WEB')
    setDescription('')
    setGeneration(GENERATION_OPTIONS[0])
    setActivity(ACTIVITY_OPTIONS[0])
    setOverview('')
    setFeatures([''])
    setImages([])
    setPassphrase('')
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(false)
  }, [isOpen])

  if (!isOpen) return null

  const handleFeatureChange = (index, value) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)))
  }

  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, ''])
  }

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    if (!passphrase.trim()) {
      setErrorMessage('운영진 암호를 먼저 입력해 주세요.')
      return
    }

    const availableSlots = MAX_IMAGES - images.length
    if (files.length > availableSlots) {
      setErrorMessage(`이미지는 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`)
    }
    const filesToUpload = files.slice(0, Math.max(availableSlots, 0))
    if (filesToUpload.length === 0) return

    const newEntries = filesToUpload.map((file) => ({
      localId: createLocalId(),
      file,
      previewUrl: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: null,
    }))
    setImages((prev) => [...prev, ...newEntries])

    newEntries.forEach((entry) => {
      uploadImage(entry.file, 'projects', passphrase)
        .then((url) => {
          setImages((prev) =>
            prev.map((img) =>
              img.localId === entry.localId ? { ...img, url, uploading: false } : img,
            ),
          )
        })
        .catch((err) => {
          const message = err.status === 401 ? '운영진 암호가 올바르지 않습니다.' : err.message || '업로드 실패'
          setImages((prev) =>
            prev.map((img) =>
              img.localId === entry.localId ? { ...img, uploading: false, error: message } : img,
            ),
          )
        })
    })
  }

  const handleRemoveImage = (localId) => {
    setImages((prev) => {
      const target = prev.find((img) => img.localId === localId)
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((img) => img.localId !== localId)
    })
  }

  const handleMoveImage = (index, direction) => {
    setImages((prev) => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const trimmedFeatures = features.map((f) => f.trim()).filter(Boolean)
    const uploadedImageUrls = images.filter((img) => img.url).map((img) => img.url)

    if (!title.trim() || !description.trim() || !overview.trim() || !generation.trim()) {
      setErrorMessage('필수 항목을 모두 입력해주세요.')
      return
    }
    if (trimmedFeatures.length === 0) {
      setErrorMessage('주요 기능을 하나 이상 입력해주세요.')
      return
    }
    if (images.some((img) => img.uploading)) {
      setErrorMessage('이미지 업로드가 끝날 때까지 잠시 기다려주세요.')
      return
    }
    if (uploadedImageUrls.length === 0) {
      setErrorMessage('이미지를 최소 1장 이상 등록해주세요.')
      return
    }
    if (!passphrase.trim()) {
      setErrorMessage('운영진 암호를 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        tag,
        description: description.trim(),
        generation: generation.trim(),
        activity,
        overview: overview.trim(),
        features: trimmedFeatures,
        images: uploadedImageUrls,
      }
      const result = await registerProject({ ...payload, passphrase })
      onCreated?.({
        id: result.id,
        title: payload.title,
        tag: payload.tag,
        description: payload.description,
        generation: payload.generation,
        activity: payload.activity,
        image: uploadedImageUrls[0],
        thumbnail: uploadedImageUrls[0],
        detail: {
          thumbnail: uploadedImageUrls[0],
          images: uploadedImageUrls,
          overview: payload.overview,
          features: payload.features,
        },
      })
      setSuccessMessage('등록되었습니다. 배포가 반영되기까지 1분 정도 걸릴 수 있습니다.')
      setTimeout(onClose, 1500)
    } catch (err) {
      setErrorMessage(err.status === 401 ? '운영진 암호가 올바르지 않습니다.' : err.message || '프로젝트 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center p-4'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#1A1A1A] text-white'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-white/10 px-6 py-4'>
          <h2 className='text-lg font-bold'>프로젝트 등록</h2>
          <button
            type='button'
            onClick={onClose}
            aria-label='닫기'
            className='flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white'
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className='flex-1 space-y-5 overflow-y-auto px-6 py-5'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm text-white/70'>제목 *</label>
              <input
                className={inputClassName}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='프로젝트 제목'
                required
              />
            </div>
            <div>
              <label className='mb-1 block text-sm text-white/70'>태그 *</label>
              <SelectField value={tag} onChange={(e) => setTag(e.target.value)} options={TAG_OPTIONS} />
            </div>
            <div>
              <label className='mb-1 block text-sm text-white/70'>기수 *</label>
              <SelectField
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                options={GENERATION_OPTIONS}
              />
            </div>
            <div>
              <label className='mb-1 block text-sm text-white/70'>활동 종류 *</label>
              <SelectField
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                options={ACTIVITY_OPTIONS}
              />
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm text-white/70'>한줄 소개 *</label>
            <input
              className={inputClassName}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='프로젝트를 한 줄로 소개해주세요'
              required
            />
          </div>

          <div>
            <label className='mb-1 block text-sm text-white/70'>프로젝트 개요 *</label>
            <textarea
              className={`${inputClassName} min-h-[120px] resize-y`}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder='프로젝트 소개, 배경, 목표 등을 자유롭게 작성해주세요'
              required
            />
          </div>

          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label className='block text-sm text-white/70'>주요 기능 *</label>
              <button
                type='button'
                onClick={handleAddFeature}
                className='text-sm text-white/60 hover:text-white'
              >
                + 기능 추가
              </button>
            </div>
            <div className='space-y-2'>
              {features.map((feature, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <input
                    className={inputClassName}
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`주요 기능 ${index + 1}`}
                  />
                  {features.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleRemoveFeature(index)}
                      aria-label='기능 삭제'
                      className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white'
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className='mb-1 flex items-center justify-between'>
              <label className='block text-sm text-white/70'>
                이미지 ({images.length}/{MAX_IMAGES}) *
              </label>
              {images.length < MAX_IMAGES && (
                <label className='cursor-pointer text-sm text-white/60 hover:text-white'>
                  + 이미지 추가
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    className='hidden'
                    onChange={handleFilesSelected}
                  />
                </label>
              )}
            </div>

            {images.length > 0 && (
              <div className='grid grid-cols-3 gap-3 md:grid-cols-4'>
                {images.map((img, index) => (
                  <div
                    key={img.localId}
                    className='relative overflow-hidden rounded-lg border border-white/20 bg-black/30'
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    <img
                      src={img.previewUrl}
                      alt={`업로드 이미지 ${index + 1}`}
                      className='h-full w-full object-cover'
                    />
                    {img.uploading && (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white'>
                        업로드 중...
                      </div>
                    )}
                    {img.error && (
                      <div className='absolute inset-0 flex items-center justify-center bg-black/70 px-1 text-center text-[10px] text-red-300'>
                        {img.error}
                      </div>
                    )}
                    <button
                      type='button'
                      onClick={() => handleRemoveImage(img.localId)}
                      aria-label='이미지 삭제'
                      className='absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80'
                    >
                      ×
                    </button>
                    <div className='absolute bottom-1 left-1 flex gap-1'>
                      <button
                        type='button'
                        onClick={() => handleMoveImage(index, -1)}
                        disabled={index === 0}
                        aria-label='앞으로 이동'
                        className='flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white disabled:opacity-30'
                      >
                        ‹
                      </button>
                      <button
                        type='button'
                        onClick={() => handleMoveImage(index, 1)}
                        disabled={index === images.length - 1}
                        aria-label='뒤로 이동'
                        className='flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white disabled:opacity-30'
                      >
                        ›
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className='mb-1 block text-sm text-white/70'>운영진 암호 *</label>
            <input
              type='password'
              className={inputClassName}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder='운영진끼리 공유한 암호'
              required
            />
          </div>

          {errorMessage && <p className='text-sm text-red-400'>{errorMessage}</p>}
          {successMessage && <p className='text-sm text-green-400'>{successMessage}</p>}
        </form>

        <div className='flex justify-end gap-2 border-t border-white/10 px-6 py-4'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full border border-white/30 px-4 py-2 text-sm hover:bg-white/10'
          >
            취소
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:opacity-90 disabled:opacity-50'
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
