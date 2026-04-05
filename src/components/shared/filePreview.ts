export interface PreviewableFile {
  id?: string
  name: string
  url?: string
  downloadUrl?: string
  mimeType?: string
}

export type PreviewKind = 'image' | 'pdf' | 'text' | 'audio' | 'video' | 'unsupported'

function getNameFromUrl(url?: string) {
  if (!url) return ''
  const cleanUrl = url.split('?')[0] || ''
  const segments = cleanUrl.split('/')
  return segments[segments.length - 1] || ''
}

export function getFileExtension(file: PreviewableFile) {
  const source = (file.name || getNameFromUrl(file.url)).toLowerCase()
  const lastDotIndex = source.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return source.slice(lastDotIndex + 1)
}

export function getPreviewKind(file: PreviewableFile): PreviewKind {
  const extension = getFileExtension(file)

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  if (['txt', 'md', 'json', 'log', 'csv'].includes(extension)) return 'text'
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return 'audio'
  if (['mp4', 'webm', 'mov', 'm4v'].includes(extension)) return 'video'
  return 'unsupported'
}

export function getExtensionLabel(file: PreviewableFile) {
  const extension = getFileExtension(file)
  return extension ? extension.toUpperCase() : 'FILE'
}
