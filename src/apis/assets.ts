import { API_BASE_URL, API_PUBLIC_BASE_URL, http } from './http'

export interface AssetResource {
  id: number
  type: string
  module: string
  owner_type: string | null
  owner_id: number | null
  original_name: string
  mime_type: string
  file_size: number
  url: string
  preview_url: string
  download_url: string
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface UploadAssetPayload {
  type: string
  module?: string
  ownerType?: string | null
  ownerId?: number | null
  file: File
}

export async function uploadAsset(payload: UploadAssetPayload) {
  const formData = new FormData()
  formData.append('type', payload.type)
  formData.append('module', payload.module || 'general')
  if (payload.ownerType) {
    formData.append('owner_type', payload.ownerType)
  }
  if (typeof payload.ownerId === 'number') {
    formData.append('owner_id', String(payload.ownerId))
  }
  formData.append('file', payload.file)

  const response = await http.post<AssetResource>('/v1/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

function toApiRequestUrl(url: string) {
  if (url.startsWith(API_BASE_URL) || url.startsWith(API_PUBLIC_BASE_URL)) {
    return url
  }
  if (url.startsWith('/')) {
    return `${API_PUBLIC_BASE_URL}${url}`
  }
  return `${API_PUBLIC_BASE_URL}/${url}`
}

export async function fetchAssetBlob(url: string) {
  const response = await http.get<Blob>(toApiRequestUrl(url), {
    responseType: 'blob',
  })
  return response.data
}

export async function createAssetObjectUrl(url: string) {
  const blob = await fetchAssetBlob(url)
  return URL.createObjectURL(blob)
}

export async function fetchAssetText(url: string) {
  const blob = await fetchAssetBlob(url)
  return await blob.text()
}

export async function downloadProtectedAsset(url: string, filename?: string) {
  const blob = await fetchAssetBlob(url)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename || 'download'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}
