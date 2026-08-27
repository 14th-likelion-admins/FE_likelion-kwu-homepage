import { request } from './client'

export function listProjects() {
  return request('/api/projects')
}

export function getProjectDetail(id) {
  return request(`/api/projects/${id}`)
}

export function createProject(payload) {
  return request('/api/projects', {
    method: 'POST',
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
