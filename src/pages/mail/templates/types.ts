export interface MailTemplateCategory {
  id: string
  name: string
  parentId: string | null
  sortOrder: number
  enabled: boolean
}

export interface MailAttachment {
  id: string
  assetId: number
  name: string
  url?: string
  downloadUrl?: string
  mimeType?: string
}

export interface MailTemplateRecord {
  id: string
  name: string
  categoryId: string
  subject: string
  content: string
  attachments: MailAttachment[]
  variables: string[]
}
