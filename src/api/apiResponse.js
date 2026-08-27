/**
 * Vercel 서버리스 함수 공통 응답 계약({success, ...} / {success:false, message})을 처리한다.
 * passphrase가 틀리면 401과 함께 success:false가 오므로 그 경우도 에러로 취급한다.
 */
export async function parseApiResponse(response, fallbackMessage) {
  let result = null
  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || fallbackMessage)
    error.status = response.status
    throw error
  }

  return result
}
