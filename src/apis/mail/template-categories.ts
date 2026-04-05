import { http } from '../http'

export interface MailTemplateCategory {
  id: number
  parent_id: number | null
  name: string
  sort_order: number
  enabled: boolean
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface MailTemplateCategoryPayload {
  parent_id?: number | null
  name: string
  sort_order?: number
  enabled?: boolean
}

export async function listMailTemplateCategories() {
  const response = await http.get<MailTemplateCategory[]>(`/v1/mail/template-categories`)
  return response.data
}

export async function createMailTemplateCategory(payload: MailTemplateCategoryPayload) {
  const response = await http.post<MailTemplateCategory>(`/v1/mail/template-categories`, payload)
  return response.data
}

export async function updateMailTemplateCategory(categoryId: number, payload: Partial<MailTemplateCategoryPayload>) {
  const response = await http.patch<MailTemplateCategory>(`/v1/mail/template-categories/${categoryId}`, payload)
  return response.data
}

export async function deleteMailTemplateCategory(categoryId: number) {
  const response = await http.delete<{ message: string }>(`/v1/mail/template-categories/${categoryId}`)
  return response.data
}
