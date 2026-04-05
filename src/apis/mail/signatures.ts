import { http } from '../http'
import type { AssetResource } from '../assets'

export interface MailSignature {
  id: number
  name: string
  owner: string | null
  enabled: boolean
  full_name: string
  job_title: string | null
  company_name: string | null
  primary_email: string | null
  secondary_email: string | null
  website: string | null
  linkedin_label: string | null
  linkedin_url: string | null
  address: string | null
  avatar_asset_id: number | null
  banner_asset_id: number | null
  avatar_asset: AssetResource | null
  banner_asset: AssetResource | null
  html: string
  created_at: string
  updated_at: string | null
  data: Record<string, unknown>
}

export interface MailSignaturePayload {
  name: string
  owner?: string | null
  enabled: boolean
  full_name: string
  job_title?: string | null
  company_name?: string | null
  primary_email?: string | null
  secondary_email?: string | null
  website?: string | null
  linkedin_label?: string | null
  linkedin_url?: string | null
  address?: string | null
  avatar_asset_id?: number | null
  banner_asset_id?: number | null
}

export async function listMailSignatures() {
  const response = await http.get<MailSignature[]>(`/v1/mail/signatures`)
  return response.data
}

export async function createMailSignature(payload: MailSignaturePayload) {
  const response = await http.post<MailSignature>(`/v1/mail/signatures`, payload)
  return response.data
}

export async function updateMailSignature(signatureId: number, payload: Partial<MailSignaturePayload>) {
  const response = await http.patch<MailSignature>(`/v1/mail/signatures/${signatureId}`, payload)
  return response.data
}

export async function deleteMailSignature(signatureId: number) {
  const response = await http.delete<{ message: string }>(`/v1/mail/signatures/${signatureId}`)
  return response.data
}
