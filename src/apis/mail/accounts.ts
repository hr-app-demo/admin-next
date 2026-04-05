import { http } from '../http'

export type MailProvider = 'qq' | '163' | 'gmail' | 'm365'
export type MailAccountStatus = 'enabled' | 'pending' | 'disabled'

export interface MailAccount {
  id: number
  email: string
  provider: MailProvider
  provider_label: string
  smtp_username: string
  smtp_host: string
  smtp_port: number
  security_mode: 'ssl' | 'starttls' | 'none'
  auth_secret: string
  status: MailAccountStatus
  note: string | null
  verified_at: string | null
  last_tested_at: string | null
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface MailAccountPayload {
  email: string
  provider: MailProvider
  auth_secret: string
  status: MailAccountStatus
  note?: string | null
}

export async function listMailAccounts() {
  const response = await http.get<MailAccount[]>('/v1/mail/accounts')
  return response.data
}

export async function createMailAccount(payload: MailAccountPayload) {
  const response = await http.post<MailAccount>('/v1/mail/accounts', payload)
  return response.data
}

export async function updateMailAccount(accountId: number, payload: Partial<MailAccountPayload>) {
  const response = await http.patch<MailAccount>(`/v1/mail/accounts/${accountId}`, payload)
  return response.data
}

export async function deleteMailAccount(accountId: number) {
  const response = await http.delete<{ message: string }>(`/v1/mail/accounts/${accountId}`)
  return response.data
}
