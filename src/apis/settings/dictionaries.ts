import type { DictionaryDefinition, DictionaryOption } from '../../data/formConfig'
import { http } from '../http'

interface DictionaryApiRecord {
  id: number
  label: string
  options: DictionaryOption[]
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface DictionaryPayload {
  label: string
  options: DictionaryOption[]
}

function toDictionaryDefinition(record: DictionaryApiRecord): DictionaryDefinition {
  return {
    id: String(record.id),
    label: record.label,
    options: record.options,
  }
}

export async function listDictionaries() {
  const response = await http.get<DictionaryApiRecord[]>('/v1/settings/dictionaries')
  return response.data.map(toDictionaryDefinition)
}

export async function getDictionary(dictionaryId: string) {
  const response = await http.get<DictionaryApiRecord>(`/v1/settings/dictionaries/${dictionaryId}`)
  return toDictionaryDefinition(response.data)
}

export async function createDictionary(payload: DictionaryPayload) {
  const response = await http.post<DictionaryApiRecord>('/v1/settings/dictionaries', payload)
  return toDictionaryDefinition(response.data)
}

export async function updateDictionary(dictionaryId: string, payload: Partial<DictionaryPayload>) {
  const response = await http.patch<DictionaryApiRecord>(`/v1/settings/dictionaries/${dictionaryId}`, payload)
  return toDictionaryDefinition(response.data)
}

export async function deleteDictionary(dictionaryId: string) {
  const response = await http.delete<{ message: string }>(`/v1/settings/dictionaries/${dictionaryId}`)
  return response.data
}
