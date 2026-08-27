const MAX_WIDTH = 1600
const JPEG_QUALITY = 0.8

const renameToJpg = (filename) => {
  const dotIndex = filename.lastIndexOf('.')
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename
  return `${base}.jpg`
}

/**
 * 업로드 전 이미지를 canvas로 리사이즈해서 용량을 줄인다.
 * 원본이 maxWidth보다 작으면 확대하지 않는다.
 */
export function resizeImageFile(file, { maxWidth = MAX_WIDTH, quality = JPEG_QUALITY } = {}) {
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

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl)
          if (!blob) {
            reject(new Error('이미지를 처리하지 못했습니다.'))
            return
          }
          resolve(new File([blob], renameToJpg(file.name), { type: 'image/jpeg' }))
        },
        'image/jpeg',
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
