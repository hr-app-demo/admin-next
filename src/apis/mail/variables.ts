import { http } from '../http'

export interface MailVariableItem {
  key: string
  label: string
}

export async function listMailVariables() {
  const response = await http.get<{ items: MailVariableItem[] }>('/v1/mail/variables')
  return response.data.items
}
