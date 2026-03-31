export interface MailTemplateOption {
  id: string
  name: string
  subject: string
  content: string
}

export interface MailSignatureOption {
  id: string
  name: string
  content: string
}

export interface MailAccountOption {
  id: string
  name: string
  email: string
}

export const mailTemplateOptions: MailTemplateOption[] = [
  {
    id: 'assessment-uk',
    name: 'UK 测试题发送通知',
    subject: '请提交 {{job_title}} 测试题',
    content: '<p>Hi {{candidate_name}}，请在规定时间内完成 {{job_title}} 的测试题，并通过系统提交。</p>',
  },
  {
    id: 'assessment-id',
    name: 'Indonesia 测试题发送通知',
    subject: 'Assessment for {{job_title}}',
    content: '<p>Please complete the assessment for {{job_title}} and submit it before the due date.</p>',
  },
  {
    id: 'contract-uk',
    name: 'UK 合同补全提醒',
    subject: '请补全 {{job_title}} 的签约资料',
    content: '<p>请尽快补全签约所需信息与附件，便于后续发出正式合同。</p>',
  },
  {
    id: 'contract-br',
    name: 'Brazil 合同发送邮件',
    subject: 'Contract package for {{job_title}}',
    content: '<p>Please review the attached contract package and send back the signed version when ready.</p>',
  },
]

export const mailSignatureOptions: MailSignatureOption[] = [
  { id: 'sig-1', name: '招聘团队标准签名', content: '<p>Best regards,<br/>DA Recruiting Team</p>' },
  { id: 'sig-2', name: 'International Hiring Signature', content: '<p>Best regards,<br/>DA Global Hiring</p>' },
]

export const mailAccountOptions: MailAccountOption[] = [
  { id: 'account-1', name: 'DA Recruiting', email: 'hiring@da.example.com' },
  { id: 'account-2', name: 'DA Global Hiring', email: 'global-hiring@da.example.com' },
]
