import { resizeImageFile } from '../utils/imageResize'
import { parseApiResponse } from './apiResponse'

/**
 * 이미지를 리사이즈한 뒤 /api/upload-image로 업로드한다.
 * 이 서버리스 함수가 GitHub Contents API로 public/uploads/{folder}/에 커밋한다.
 *
 * 리사이즈 결과의 픽셀 크기를 함께 돌려준다. 렌더러가 <img width height>로
 * 고유 비율을 잡아야 로드 전에 자리가 접히지 않는다.
 *
 * @returns {Promise<{ url: string, width: number, height: number }>}
 */
export async function uploadImage(file, folder, passphrase) {
  const { file: resized, width, height } = await resizeImageFile(file)

  const formData = new FormData()
  formData.append('file', resized)
  formData.append('folder', folder)
  formData.append('passphrase', passphrase)

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  const result = await parseApiResponse(response, '이미지 업로드에 실패했습니다.')
  return { url: result.url, width, height }
}
