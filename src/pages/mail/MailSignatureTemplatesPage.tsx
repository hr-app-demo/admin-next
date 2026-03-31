import {
  Button,
  Card,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import RichTextEditor from '../../components/RichTextEditor'

interface SignatureRecord {
  id: string
  name: string
  language: string
  owner: string
  content: string
  enabled: boolean
}

const initialSignatures: SignatureRecord[] = [
  {
    id: 'sig-1',
    name: '招聘团队标准签名',
    language: '中文',
    owner: 'Recruit Ops',
    content: '<p>Best regards,<br/>DA Recruiting Team<br/>hr@da.example.com</p>',
    enabled: true,
  },
  {
    id: 'sig-2',
    name: 'International Hiring Signature',
    language: 'English',
    owner: 'Global Recruiting',
    content: '<p>Best regards,<br/>DA Global Hiring<br/>hiring@da.example.com</p>',
    enabled: true,
  },
]

function createEmptySignature(index: number): SignatureRecord {
  return {
    id: `sig-new-${index + 1}`,
    name: `新签名 ${index + 1}`,
    language: '中文',
    owner: '',
    content: '<p><br></p>',
    enabled: true,
  }
}

export default function MailSignatureTemplatesPage() {
  const [signatures, setSignatures] = useState(initialSignatures)
  const [selectedId, setSelectedId] = useState(initialSignatures[0]?.id || '')
  const [draft, setDraft] = useState<SignatureRecord | null>(initialSignatures[0] || null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isCreating) return
    const current = signatures.find((item) => item.id === selectedId) || signatures[0] || null
    setSelectedId(current?.id || '')
    setDraft(current ? { ...current } : null)
  }, [isCreating, selectedId, signatures])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptySignature(signatures.length))
  }

  const handleSave = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      Message.warning('请先填写签名名称')
      return
    }
    const next = {
      ...draft,
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      content: draft.content.trim(),
    }
    if (isCreating) {
      setSignatures((current) => [...current, next])
      Message.success('签名模板已创建')
    } else {
      setSignatures((current) => current.map((item) => (item.id === next.id ? next : item)))
      Message.success('签名模板已保存')
    }
    setIsCreating(false)
    setSelectedId(next.id)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = signatures[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(fallback ? { ...fallback } : null)
      return
    }
    const next = signatures.filter((item) => item.id !== draft.id)
    setSignatures(next)
    const fallback = next[0] || null
    setSelectedId(fallback?.id || '')
    setDraft(fallback ? { ...fallback } : null)
    Message.success('签名模板已删除')
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptySignature(signatures.length))
      return
    }
    const current = signatures.find((item) => item.id === selectedId) || null
    setDraft(current ? { ...current } : null)
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          title="邮件签名模板"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增签名
            </Button>
          }
        >
          <div className="next-settings-nav">
            {signatures.map((signature) => (
              <button
                key={signature.id}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedId === signature.id ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedId(signature.id)
                }}
              >
                <div>
                  <strong>{signature.name}</strong>
                  <span>{signature.owner || '未填写团队'}</span>
                </div>
                <Tag color={signature.enabled ? 'green' : 'gray'}>{signature.language}</Tag>
              </button>
            ))}
            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div>
                  <strong>新签名</strong>
                  <span>未保存</span>
                </div>
                <Tag color="arcoblue">草稿</Tag>
              </button>
            ) : null}
          </div>
        </Card>

        <div className="next-settings-content">
          <Card
            bordered={false}
            className="next-panel"
            title={isCreating ? '新建签名模板' : '签名详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm
                  title={isCreating ? '放弃当前新签名？' : '确认删除这个签名吗？'}
                  onOk={handleDelete}
                >
                  <Button status="danger" icon={<IconDelete />}>
                    {isCreating ? '放弃' : '删除'}
                  </Button>
                </Popconfirm>
                <Button type="primary" onClick={handleSave}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-settings-workspace__field-grid">
                  <div className="next-job-create__field">
                    <label>签名名称</label>
                    <Input
                      value={draft.name}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, name: value } : current))
                      }
                    />
                  </div>
                  <div className="next-job-create__field">
                    <label>所属团队</label>
                    <Input
                      value={draft.owner}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, owner: value } : current))
                      }
                    />
                  </div>
                  <div className="next-job-create__field">
                    <label>语言</label>
                    <Select
                      value={draft.language}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, language: String(value) } : current,
                        )
                      }
                    >
                      {['中文', '英文', '中文 / 英文'].map((item) => (
                        <Select.Option key={item} value={item}>
                          {item}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>启用状态</label>
                    <Select
                      value={draft.enabled ? 'enabled' : 'disabled'}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, enabled: value === 'enabled' } : current,
                        )
                      }
                    >
                      <Select.Option value="enabled">启用</Select.Option>
                      <Select.Option value="disabled">停用</Select.Option>
                    </Select>
                  </div>
                </div>

                <div className="next-job-create__field">
                  <label>签名内容</label>
                  <RichTextEditor
                    value={draft.content}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, content: value } : current))
                    }
                    placeholder="填写签名内容、团队信息和联系方式"
                  />
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的签名模板。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
