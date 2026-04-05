import { Descriptions, Input, Message, Modal, Select } from '@arco-design/web-react'
import { useEffect, useMemo, useState } from 'react'
import { listMailAccounts, type MailAccount } from '../../apis/mail/accounts'
import { getApiErrorMessage, resolveApiHtml } from '../../apis/http'
import { createMailSendTask } from '../../apis/mail/send'
import { listMailSignatures, type MailSignature } from '../../apis/mail/signatures'
import { listMailTemplates, type MailTemplate } from '../../apis/mail/templates'
import RichTextEditor from '../RichTextEditor'

interface SendMailModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  recipientName: string
  recipientEmail: string
  recipients?: Array<{ name: string; email: string }>
}

function buildMailBody(template: MailTemplate | null, signature: MailSignature | null) {
  const templateHtml = template?.body_html?.trim() || ''
  const signatureHtml = resolveApiHtml(signature?.html || '')

  if (templateHtml && signatureHtml) {
    return `${templateHtml}<div style="margin-top:24px;">${signatureHtml}</div>`
  }
  return templateHtml || signatureHtml || '<p><br></p>'
}

export default function SendMailModal({
  visible,
  onVisibleChange,
  recipientName,
  recipientEmail,
  recipients,
}: SendMailModalProps) {
  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [templates, setTemplates] = useState<MailTemplate[]>([])
  const [signatures, setSignatures] = useState<MailSignature[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedSignatureId, setSelectedSignatureId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('<p><br></p>')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === selectedTemplateId) || null,
    [selectedTemplateId, templates],
  )
  const selectedSignature = useMemo(
    () => signatures.find((item) => String(item.id) === selectedSignatureId) || null,
    [selectedSignatureId, signatures],
  )
  const selectedAccount = useMemo(
    () => accounts.find((item) => String(item.id) === selectedAccountId) || null,
    [accounts, selectedAccountId],
  )

  const recipientItems = useMemo(() => {
    if (recipients?.length) return recipients
    if (!recipientEmail) return []
    return [{ name: recipientName, email: recipientEmail }]
  }, [recipientEmail, recipientName, recipients])

  const recipientSummary = recipientItems.length
    ? recipientItems.slice(0, 3).map((item) => item.name || item.email).join('、')
    : '-'

  const recipientEmailSummary =
    recipientItems.length > 1
      ? `共 ${recipientItems.length} 个收件人`
      : recipientItems[0]?.email || '-'

  async function loadResources(preferredTemplateId?: string, preferredSignatureId?: string) {
    setLoading(true)
    try {
      const [nextTemplates, nextSignatures] = await Promise.all([
        listMailTemplates(),
        listMailSignatures(),
      ])
      setTemplates(nextTemplates)
      setSignatures(nextSignatures)

      const nextTemplate =
        nextTemplates.find((item) => String(item.id) === preferredTemplateId) ||
        nextTemplates[0] ||
        null
      const nextSignature =
        nextSignatures.find((item) => String(item.id) === preferredSignatureId) ||
        nextSignatures[0] ||
        null

      setSelectedTemplateId(nextTemplate ? String(nextTemplate.id) : '')
      setSelectedSignatureId(nextSignature ? String(nextSignature.id) : '')
      setSubject(nextTemplate?.subject_template || '')
      setBody(buildMailBody(nextTemplate, nextSignature))
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载邮件模板失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!visible) return

    async function bootstrap() {
      setLoading(true)
      try {
        const nextAccounts = await listMailAccounts()
        setAccounts(nextAccounts)
        const defaultAccount =
          nextAccounts.find((item) => item.status === 'enabled') ||
          nextAccounts[0] ||
          null
        const nextAccountId = defaultAccount ? String(defaultAccount.id) : ''
        setSelectedAccountId(nextAccountId)
        await loadResources()
      } catch (error) {
        Message.error(getApiErrorMessage(error, '加载发信账号失败'))
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [visible])

  const handleTemplateChange = (value: string) => {
    const template = templates.find((item) => String(item.id) === value) || null
    setSelectedTemplateId(value)
    setSubject(template?.subject_template || '')
    setBody(buildMailBody(template, selectedSignature))
  }

  const handleSignatureChange = (value: string) => {
    const signature = signatures.find((item) => String(item.id) === value) || null
    setSelectedSignatureId(value)
    setBody(buildMailBody(selectedTemplate, signature))
  }

  const handleSend = async () => {
    if (!selectedAccountId) {
      Message.warning('请先选择发信账号')
      return
    }
    if (!recipientItems.length) {
      Message.warning('当前没有可发送的收件人')
      return
    }
    if (!subject.trim()) {
      Message.warning('请先填写邮件主题')
      return
    }
    if (!body.trim() || body.trim() === '<p><br></p>') {
      Message.warning('请先填写邮件正文')
      return
    }

    setSubmitting(true)
    try {
      await createMailSendTask({
        account_id: Number(selectedAccountId),
        template_id: selectedTemplate ? selectedTemplate.id : null,
        signature_id: selectedSignature ? selectedSignature.id : null,
        subject: subject.trim(),
        body_html: body,
        to_recipients: recipientItems.map((item) => ({
          name: item.name || undefined,
          email: item.email,
        })),
        attachment_asset_ids: selectedTemplate?.attachments.map((item) => item.asset_id) || [],
        render_context: {
          candidate: recipientItems[0]
            ? {
                name: recipientItems[0].name,
                email: recipientItems[0].email,
              }
            : {},
          sender: {
            name: selectedSignature?.full_name || undefined,
            email: selectedAccount?.email || undefined,
          },
          company: {
            name: selectedSignature?.company_name || undefined,
          },
        },
      })
      Message.success(
        recipientItems.length > 1
          ? `已为 ${recipientItems.length} 位候选人创建发信任务`
          : `已为 ${recipientItems[0]?.name || recipientItems[0]?.email || ''} 创建发信任务`,
      )
      onVisibleChange(false)
    } catch (error) {
      Message.error(getApiErrorMessage(error, '创建发信任务失败'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="发送邮件"
      visible={visible}
      style={{ width: 920 }}
      className="next-modal--70vh"
      confirmLoading={submitting}
      onCancel={() => onVisibleChange(false)}
      onOk={() => void handleSend()}
    >
      <div className="next-modal-stack" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Descriptions
          column={1}
          data={[
            { label: '候选人', value: recipientSummary },
            { label: '邮箱', value: recipientEmailSummary },
          ]}
        />

        <div className="next-settings-workspace__field-grid">
          <div>
            <div className="next-modal-label">发送邮箱账号</div>
            <Select
              loading={loading}
              value={selectedAccountId || undefined}
              placeholder="请选择发信账号"
              onChange={(value) => {
                const nextAccountId = value == null ? '' : String(value)
                setSelectedAccountId(nextAccountId)
              }}
            >
              {accounts.map((item) => (
                <Select.Option key={item.id} value={String(item.id)}>
                  {item.email}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <div className="next-modal-label">邮件模板</div>
            <Select
              loading={loading}
              value={selectedTemplateId || undefined}
              placeholder="可选，不使用模板也可手动编辑"
              allowClear
              onChange={(value) => handleTemplateChange(value == null ? '' : String(value))}
              onClear={() => handleTemplateChange('')}
            >
              {templates.map((item) => (
                <Select.Option key={item.id} value={String(item.id)}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <div className="next-modal-label">签名模板</div>
            <Select
              loading={loading}
              value={selectedSignatureId || undefined}
              placeholder="可选，不使用签名也可直接发送"
              allowClear
              onChange={(value) => handleSignatureChange(value == null ? '' : String(value))}
              onClear={() => handleSignatureChange('')}
            >
              {signatures.map((item) => (
                <Select.Option key={item.id} value={String(item.id)}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <div className="next-modal-label">邮件主题</div>
          <Input value={subject} onChange={setSubject} placeholder="可以在模板基础上修改邮件主题" />
        </div>

        <div>
          <div className="next-modal-label">邮件正文</div>
          <RichTextEditor value={body} onChange={setBody} placeholder="可以在模板基础上继续调整邮件正文" />
        </div>
      </div>
    </Modal>
  )
}
