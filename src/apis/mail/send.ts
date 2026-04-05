import { http } from '../http'

export interface MailRecipientPayload {
  name?: string
  email: string
}

export interface MailSendPayload {
  account_id: number
  template_id?: number | null
  signature_id?: number | null
  subject: string
  body_html: string
  to_recipients: MailRecipientPayload[]
  cc_recipients?: MailRecipientPayload[]
  bcc_recipients?: MailRecipientPayload[]
  attachment_asset_ids?: number[]
  render_context?: Record<string, unknown>
}

export interface MailTaskRecord {
  id: number
  account_id: number
  template_id: number | null
  signature_id: number | null
  subject: string
  body_html: string
  status: string
  created_at: string
  updated_at: string | null
}

export async function createMailSendTask(payload: MailSendPayload) {
  const response = await http.post<MailTaskRecord>('/v1/mail/send', payload)
  return response.data
}
