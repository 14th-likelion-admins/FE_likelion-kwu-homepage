import { parseApiResponse } from './apiResponse'

export { uploadImage } from './uploadImage'

export async function registerProject(payload) {
  const response = await fetch('/api/register-project', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return parseApiResponse(response, '프로젝트 등록에 실패했습니다.')
}
