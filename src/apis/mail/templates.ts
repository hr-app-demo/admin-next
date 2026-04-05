import { http } from '../http'

export interface MailTemplateAttachment {
  asset_id: number
  name: string
  mime_type: string
  preview_url: string
  download_url: string
}

export interface MailTemplate {
  id: number
  category_id: number
  name: string
  subject_template: string
  body_html: string
  attachments: MailTemplateAttachment[]
  variables: string[]
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface MailTemplatePayload {
  category_id: number
  name: string
  subject_template: string
  body_html: string
  attachments: Array<{ asset_id: number }>
}

export async function listMailTemplates() {
  const response = await http.get<MailTemplate[]>(`/v1/mail/templates`)
  return response.data
}

export async function createMailTemplate(payload: MailTemplatePayload) {
  const response = await http.post<MailTemplate>(`/v1/mail/templates`, payload)
  return response.data
}

export async function updateMailTemplate(templateId: number, payload: Partial<MailTemplatePayload>) {
  const response = await http.patch<MailTemplate>(`/v1/mail/templates/${templateId}`, payload)
  return response.data
}

export async function deleteMailTemplate(templateId: number) {
  const response = await http.delete<{ message: string }>(`/v1/mail/templates/${templateId}`)
  return response.data
}
