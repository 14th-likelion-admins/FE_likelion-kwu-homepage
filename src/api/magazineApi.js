import magazines from '../data/magazines.json'
import { parseApiResponse } from './apiResponse'

export { uploadImage } from './uploadImage'

/**
 * magazines.json은 빌드에 함께 커밋된 정적 데이터이므로 네트워크 호출 없이 동기적으로 조회한다.
 */
export function getMagazine(activityType, generation) {
  return magazines[activityType]?.[String(generation)] ?? null
}

export async function saveMagazine(activityType, generation, payload, passphrase) {
  const response = await fetch('/api/register-magazine', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passphrase, activityType, generation, ...payload }),
  })

  return parseApiResponse(response, '매거진 저장에 실패했습니다.')
}
