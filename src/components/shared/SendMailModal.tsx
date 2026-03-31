import { Descriptions, Input, Message, Modal, Select } from '@arco-design/web-react'
import { useEffect, useMemo, useState } from 'react'
import RichTextEditor from '../RichTextEditor'
import { mailAccountOptions, mailSignatureOptions, mailTemplateOptions } from '../../data/communicationMock'

interface SendMailModalProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  recipientName: string
  recipientEmail: string
  recipients?: Array<{ name: string; email: string }>
}

export default function SendMailModal({
  visible,
  onVisibleChange,
  recipientName,
  recipientEmail,
  recipients,
}: SendMailModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(mailTemplateOptions[0]?.id || '')
  const [selectedSignatureId, setSelectedSignatureId] = useState(mailSignatureOptions[0]?.id || '')
  const [selectedAccountId, setSelectedAccountId] = useState(mailAccountOptions[0]?.id || '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('<p><br></p>')

  const selectedTemplate = useMemo(
    () => mailTemplateOptions.find((item) => item.id === selectedTemplateId) || null,
    [selectedTemplateId],
  )
  const selectedSignature = useMemo(
    () => mailSignatureOptions.find((item) => item.id === selectedSignatureId) || null,
    [selectedSignatureId],
  )
  const selectedAccount = useMemo(
    () => mailAccountOptions.find((item) => item.id === selectedAccountId) || null,
    [selectedAccountId],
  )

  useEffect(() => {
    if (!visible) return
    const template = mailTemplateOptions[0] || null
    const signature = mailSignatureOptions[0] || null
    setSelectedTemplateId(template?.id || '')
    setSelectedSignatureId(signature?.id || '')
    setSelectedAccountId(mailAccountOptions[0]?.id || '')
    setSubject(template?.subject || '')
    setBody(`${template?.content || '<p><br></p>'}${signature?.content || ''}`)
  }, [visible])

  const handleTemplateChange = (value: string) => {
    const template = mailTemplateOptions.find((item) => item.id === value) || null
    setSelectedTemplateId(value)
    setSubject(template?.subject || '')
    setBody(`${template?.content || '<p><br></p>'}${selectedSignature?.content || ''}`)
  }

  const handleSignatureChange = (value: string) => {
    const signature = mailSignatureOptions.find((item) => item.id === value) || null
    setSelectedSignatureId(value)
    setBody(`${selectedTemplate?.content || '<p><br></p>'}${signature?.content || ''}`)
  }

  const handleSend = () => {
    if (!selectedTemplate || !selectedSignature || !selectedAccount) {
      Message.warning('请先选择邮件模板、签名模板和发信账号')
      return
    }
    Message.success(
      recipients?.length
        ? `已为 ${recipients.length} 位候选人创建发信任务`
        : `已为 ${recipientName} 创建发信任务`,
    )
    onVisibleChange(false)
  }

  const recipientSummary = recipients?.length
    ? recipients.slice(0, 3).map((item) => item.name).join('、')
    : recipientName

  const recipientEmailSummary = recipients?.length
    ? `共 ${recipients.length} 个收件人`
    : recipientEmail

  return (
    <Modal
      title="发送邮件"
      visible={visible}
      style={{ width: 920 }}
      className="next-modal--70vh"
      onCancel={() => onVisibleChange(false)}
      onOk={handleSend}
    >
      <div className="next-modal-stack" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Descriptions
          column={1}
          data={[
            { label: '候选人', value: recipientSummary || '-' },
            { label: '邮箱', value: recipientEmailSummary || '-' },
          ]}
        />

        <div className="next-settings-workspace__field-grid">
          <div>
            <div className="next-modal-label">邮件模板</div>
            <Select value={selectedTemplateId} onChange={(value) => handleTemplateChange(String(value))}>
              {mailTemplateOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <div className="next-modal-label">签名模板</div>
            <Select value={selectedSignatureId} onChange={(value) => handleSignatureChange(String(value))}>
              {mailSignatureOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <div className="next-modal-label">发送邮箱账号</div>
            <Select value={selectedAccountId} onChange={(value) => setSelectedAccountId(String(value))}>
              {mailAccountOptions.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name} ({item.email})
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
