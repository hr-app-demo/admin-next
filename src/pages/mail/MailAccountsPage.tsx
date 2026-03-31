import {
  Button,
  Card,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'

interface MailAccountRecord {
  id: string
  senderName: string
  email: string
  provider: string
  status: '已启用' | '待验证' | '停用'
  host: string
  port: string
  username: string
  note: string
}

const initialAccounts: MailAccountRecord[] = [
  {
    id: 'account-1',
    senderName: 'DA Recruiting',
    email: 'hiring@da.example.com',
    provider: 'SMTP',
    status: '已启用',
    host: 'smtp.da.example.com',
    port: '465',
    username: 'hiring@da.example.com',
    note: '主账号，用于招聘通知与测试题发送。',
  },
  {
    id: 'account-2',
    senderName: 'DA Global Hiring',
    email: 'global-hiring@da.example.com',
    provider: 'Google Workspace',
    status: '待验证',
    host: 'smtp.gmail.com',
    port: '587',
    username: 'global-hiring@da.example.com',
    note: '用于国际招聘与英文模板发送。',
  },
]

function createEmptyAccount(index: number): MailAccountRecord {
  return {
    id: `mail-account-${index + 1}`,
    senderName: `新发信账号 ${index + 1}`,
    email: '',
    provider: 'SMTP',
    status: '待验证',
    host: '',
    port: '',
    username: '',
    note: '',
  }
}

export default function MailAccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [selectedId, setSelectedId] = useState(initialAccounts[0]?.id || '')
  const [draft, setDraft] = useState<MailAccountRecord | null>(initialAccounts[0] || null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isCreating) return
    const current = accounts.find((item) => item.id === selectedId) || accounts[0] || null
    setSelectedId(current?.id || '')
    setDraft(current ? { ...current } : null)
  }, [accounts, isCreating, selectedId])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyAccount(accounts.length))
  }

  const handleSave = () => {
    if (!draft) return
    if (!draft.email.trim()) {
      Message.warning('请先填写邮箱账号')
      return
    }
    const next = { ...draft, senderName: draft.senderName.trim(), email: draft.email.trim(), username: draft.username.trim(), note: draft.note.trim() }
    if (isCreating) {
      setAccounts((current) => [...current, next])
      Message.success('发信账号已创建')
    } else {
      setAccounts((current) => current.map((item) => (item.id === next.id ? next : item)))
      Message.success('发信账号已保存')
    }
    setIsCreating(false)
    setSelectedId(next.id)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = accounts[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(fallback ? { ...fallback } : null)
      return
    }
    const next = accounts.filter((item) => item.id !== draft.id)
    setAccounts(next)
    const fallback = next[0] || null
    setSelectedId(fallback?.id || '')
    setDraft(fallback ? { ...fallback } : null)
    Message.success('发信账号已删除')
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyAccount(accounts.length))
      return
    }
    const current = accounts.find((item) => item.id === selectedId) || null
    setDraft(current ? { ...current } : null)
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card bordered={false} className="next-panel" title="邮箱账号管理" extra={<Button size="small" icon={<IconPlus />} onClick={beginCreate}>新增发信账号</Button>}>
          <div className="next-settings-nav">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedId === account.id ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedId(account.id)
                }}
              >
                <div>
                  <strong>{account.senderName}</strong>
                  <span>{account.email}</span>
                </div>
                <Tag color={account.status === '已启用' ? 'green' : account.status === '待验证' ? 'orange' : 'gray'}>
                  {account.status}
                </Tag>
              </button>
            ))}
            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div><strong>新账号</strong><span>未保存</span></div>
                <Tag color="arcoblue">草稿</Tag>
              </button>
            ) : null}
          </div>
        </Card>

        <div className="next-settings-content">
          <Card
            bordered={false}
            className="next-panel"
            title={isCreating ? '新建发信账号' : '账号详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>重置</Button>
                <Popconfirm title={isCreating ? '放弃当前新账号？' : '确认删除这个发信账号吗？'} onOk={handleDelete}>
                  <Button status="danger" icon={<IconDelete />}>{isCreating ? '放弃' : '删除'}</Button>
                </Popconfirm>
                <Button type="primary" onClick={handleSave}>保存</Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-settings-workspace__field-grid">
                  <div className="next-job-create__field">
                    <label>发信名称</label>
                    <Input value={draft.senderName} onChange={(value) => setDraft((current) => (current ? { ...current, senderName: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>邮箱账号</label>
                    <Input value={draft.email} onChange={(value) => setDraft((current) => (current ? { ...current, email: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>服务商</label>
                    <Select value={draft.provider} onChange={(value) => setDraft((current) => (current ? { ...current, provider: String(value) } : current))}>
                      {['SMTP', 'Google Workspace', 'Microsoft 365'].map((item) => (
                        <Select.Option key={item} value={item}>{item}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="next-job-create__field">
                    <label>用户名</label>
                    <Input value={draft.username} onChange={(value) => setDraft((current) => (current ? { ...current, username: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>SMTP Host</label>
                    <Input value={draft.host} onChange={(value) => setDraft((current) => (current ? { ...current, host: value } : current))} />
                  </div>
                  <div className="next-job-create__field">
                    <label>端口</label>
                    <Input value={draft.port} onChange={(value) => setDraft((current) => (current ? { ...current, port: value } : current))} />
                  </div>
                </div>

                <div className="next-job-create__switch-card">
                  <div>
                    <strong>启用状态</strong>
                    <span>{draft.status === '已启用' ? '该账号可用于 API 发信。' : '未启用时不会参与发信轮询。'}</span>
                  </div>
                  <Switch
                    checked={draft.status === '已启用'}
                    onChange={(checked) =>
                      setDraft((current) =>
                        current ? { ...current, status: checked ? '已启用' : '停用' } : current,
                      )
                    }
                  />
                </div>

                <div className="next-job-create__field">
                  <label>备注</label>
                  <Input.TextArea value={draft.note} onChange={(value) => setDraft((current) => (current ? { ...current, note: value } : current))} autoSize={{ minRows: 4, maxRows: 6 }} />
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的发信账号。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
