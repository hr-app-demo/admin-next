import type { FormTemplateDefinition, FormTemplateField } from '../../data/formConfig'
import { http } from '../http'

interface FormTemplateApiField extends Omit<FormTemplateField, 'dictionaryId'> {
  dictionaryId?: number | null
}

interface FormTemplateApiRecord {
  id: number
  name: string
  description: string | null
  fields: FormTemplateApiField[]
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface FormTemplatePayload {
  name: string
  description?: string
  fields: FormTemplateField[]
}

function toFormTemplateDefinition(record: FormTemplateApiRecord): FormTemplateDefinition {
  return {
    id: String(record.id),
    name: record.name,
    description: record.description || '',
    fields: record.fields.map((field) => ({
      ...field,
      dictionaryId:
        field.dictionaryId === null || field.dictionaryId === undefined
          ? undefined
          : String(field.dictionaryId),
      placeholder: field.placeholder || '',
    })),
  }
}

function toFormTemplatePayload(payload: Partial<FormTemplatePayload>) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.fields !== undefined
      ? {
          fields: payload.fields.map((field) => ({
            ...field,
            dictionaryId: field.dictionaryId ? Number(field.dictionaryId) : undefined,
          })),
        }
      : {}),
  }
}

export async function listFormTemplates() {
  const response = await http.get<FormTemplateApiRecord[]>('/v1/settings/form-templates')
  return response.data.map(toFormTemplateDefinition)
}

export async function getFormTemplate(templateId: string) {
  const response = await http.get<FormTemplateApiRecord>(`/v1/settings/form-templates/${templateId}`)
  return toFormTemplateDefinition(response.data)
}

export async function createFormTemplate(payload: FormTemplatePayload) {
  const response = await http.post<FormTemplateApiRecord>(
    '/v1/settings/form-templates',
    toFormTemplatePayload(payload),
  )
  return toFormTemplateDefinition(response.data)
}

export async function updateFormTemplate(templateId: string, payload: Partial<FormTemplatePayload>) {
  const response = await http.patch<FormTemplateApiRecord>(
    `/v1/settings/form-templates/${templateId}`,
    toFormTemplatePayload(payload),
  )
  return toFormTemplateDefinition(response.data)
}

export async function deleteFormTemplate(templateId: string) {
  const response = await http.delete<{ message: string }>(`/v1/settings/form-templates/${templateId}`)
  return response.data
}
