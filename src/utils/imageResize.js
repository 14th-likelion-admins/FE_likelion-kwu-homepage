const MAX_WIDTH = 1600
const IMAGE_QUALITY = 0.8
const WEBP_MIME = 'image/webp'
const JPEG_MIME = 'image/jpeg'

const renameToExtension = (filename, extension) => {
  const dotIndex = filename.lastIndexOf('.')
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
  return `${base}.${extension}`
}

/**
 * 업로드 전 이미지를 canvas로 리사이즈해서 용량을 줄인다.
 * 원본이 maxWidth보다 작으면 확대하지 않는다.
 *
 * @returns {Promise<{ file: File, width: number, height: number }>}
 */
export function resizeImageFile(file, { maxWidth = MAX_WIDTH, quality = IMAGE_QUALITY } = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const supportsWebp = canvas.toDataURL(WEBP_MIME).startsWith(`data:${WEBP_MIME}`)
      const outputMime = supportsWebp ? WEBP_MIME : JPEG_MIME
      const outputExtension = supportsWebp ? 'webp' : 'jpg'

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          if (!blob) {
            reject(new Error('이미지를 처리하지 못했습니다.'))
            return
          }
          const resized = new File([blob], renameToExtension(file.name, outputExtension), { type: outputMime })
          // 렌더러가 <img width height>로 고유 비율을 잡을 수 있도록 결과 크기를 함께 넘긴다.
          resolve({ file: resized, width, height })
        },
        outputMime,
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 읽을 수 없습니다.'))
    }

    img.src = objectUrl
  })
}
