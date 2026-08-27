const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  let result

  try {
    result = await response.json()
  } catch {
    throw new Error('서버 응답을 읽을 수 없습니다.')
  }

  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || '요청을 처리하지 못했습니다.')
    error.status = response.status
    throw error
  }

  return result.data
}

export function listGenerations(activityType) {
  return request(`/api/magazines/${activityType}`)
}

export function getMagazine(activityType, generation) {
  return request(`/api/magazines/${activityType}/${generation}`)
}

export function saveMagazine(activityType, generation, payload) {
  return request(`/api/magazines/${activityType}/${generation}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request('/api/images', {
    method: 'POST',
    body: formData,
  })
}
