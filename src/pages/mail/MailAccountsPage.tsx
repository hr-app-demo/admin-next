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
import { useEffect, useMemo, useState } from 'react'
import {
  createMailAccount,
  deleteMailAccount,
  listMailAccounts,
  type MailAccount,
  type MailAccountPayload,
  type MailAccountStatus,
  type MailProvider,
  updateMailAccount,
} from '../../apis/mail/accounts'
import { getApiErrorMessage } from '../../apis/http'

interface MailAccountDraft {
  id: string
  email: string
  provider: MailProvider
  status: MailAccountStatus
  authSecret: string
  note: string
}

const providerOptions: Array<{ label: string; value: MailProvider }> = [
  { label: 'QQ 邮箱', value: 'qq' },
  { label: '163 邮箱', value: '163' },
  { label: 'Google Workspace / Gmail', value: 'gmail' },
  { label: 'Microsoft 365 / Outlook', value: 'm365' },
]

const statusLabelMap: Record<MailAccountStatus, string> = {
  enabled: '已启用',
  pending: '待验证',
  disabled: '停用',
}

function createEmptyDraft(index: number): MailAccountDraft {
  return {
    id: `mail-account-${index + 1}`,
    email: '',
    provider: 'qq',
    status: 'pending',
    authSecret: '',
    note: '',
  }
}

function toDraft(record: MailAccount): MailAccountDraft {
  return {
    id: String(record.id),
    email: record.email,
    provider: record.provider,
    status: record.status,
    authSecret: record.auth_secret,
    note: record.note || '',
  }
}

function toPayload(draft: MailAccountDraft): MailAccountPayload {
  return {
    email: draft.email.trim(),
    provider: draft.provider,
    status: draft.status,
    auth_secret: draft.authSecret.trim(),
    note: draft.note.trim() || null,
  }
}

export default function MailAccountsPage() {
  const [accounts, setAccounts] = useState<MailAccount[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [draft, setDraft] = useState<MailAccountDraft | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedAccount = useMemo(
    () => accounts.find((item) => String(item.id) === selectedId) || null,
    [accounts, selectedId],
  )

  async function loadAccounts(preferredId?: string) {
    setLoading(true)
    try {
      const nextAccounts = await listMailAccounts()
      setAccounts(nextAccounts)
      const fallbackId = preferredId || selectedId
      const current =
        nextAccounts.find((item) => String(item.id) === fallbackId) ||
        nextAccounts[0] ||
        null
      setSelectedId(current ? String(current.id) : '')
      if (!isCreating) {
        setDraft(current ? toDraft(current) : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载发信账号失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isCreating) return
    setDraft(selectedAccount ? toDraft(selectedAccount) : null)
  }, [isCreating, selectedAccount])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyDraft(accounts.length))
  }

  const handleSave = async () => {
    if (!draft) return
    if (!draft.email.trim()) {
      Message.warning('请先填写邮箱账号')
      return
    }
    if (!draft.authSecret.trim()) {
      Message.warning('请先填写 SMTP 密码或授权码')
      return
    }

    setSubmitting(true)
    try {
      const payload = toPayload(draft)
      if (isCreating) {
        const created = await createMailAccount(payload)
        Message.success('发信账号已创建')
        setIsCreating(false)
        await loadAccounts(String(created.id))
        return
      }

      const updated = await updateMailAccount(Number(draft.id), payload)
      Message.success('发信账号已保存')
      await loadAccounts(String(updated.id))
    } catch (error) {
      Message.error(getApiErrorMessage(error, '保存发信账号失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = accounts[0] || null
      setSelectedId(fallback ? String(fallback.id) : '')
      setDraft(fallback ? toDraft(fallback) : null)
      return
    }

    setSubmitting(true)
    try {
      await deleteMailAccount(Number(draft.id))
      Message.success('发信账号已删除')
      await loadAccounts()
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除发信账号失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyDraft(accounts.length))
      return
    }
    setDraft(selectedAccount ? toDraft(selectedAccount) : null)
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          loading={loading}
          title="邮箱账号管理"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增发信账号
            </Button>
          }
        >
          <div className="next-settings-nav">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedId === String(account.id) ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedId(String(account.id))
                }}
              >
                <div>
                  <strong>{account.email}</strong>
                  <span>{account.provider_label}</span>
                </div>
                <Tag color={account.status === 'enabled' ? 'green' : account.status === 'pending' ? 'orange' : 'gray'}>
                  {statusLabelMap[account.status]}
                </Tag>
              </button>
            ))}

            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div>
                  <strong>新账号</strong>
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
            loading={loading}
            title={isCreating ? '新建发信账号' : '账号详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm title={isCreating ? '放弃当前新账号？' : '确认删除这个发信账号吗？'} onOk={handleDelete}>
                  <Button status="danger" icon={<IconDelete />}>
                    {isCreating ? '放弃' : '删除'}
                  </Button>
                </Popconfirm>
                <Button type="primary" loading={submitting} onClick={handleSave}>
                  保存
                </Button>
              </Space>
            }
          >
            {draft ? (
              <div className="next-job-create__form">
                <div className="next-settings-workspace__field-grid">
                  <div className="next-job-create__field">
                    <label>邮箱账号</label>
                    <Input
                      value={draft.email}
                      onChange={(value) =>
                        setDraft((current) => (current ? { ...current, email: value } : current))
                      }
                    />
                  </div>
                  <div className="next-job-create__field">
                    <label>服务商</label>
                    <Select
                      value={draft.provider}
                      onChange={(value) =>
                        setDraft((current) =>
                          current ? { ...current, provider: value as MailProvider } : current,
                        )
                      }
                    >
                      {providerOptions.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="next-job-create__field">
                  <label>SMTP 密码 / 授权码</label>
                  <Input.Password
                    value={draft.authSecret}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, authSecret: value } : current))
                    }
                    placeholder="例如邮箱授权码或应用密码"
                  />
                </div>

                <div className="next-form-inline-hint">
                  选择常见服务商后，服务端会自动使用对应的 SMTP Host、端口和加密方式；邮箱账号同时作为登录账号使用。
                </div>

                <div className="next-job-create__switch-card">
                  <div>
                    <strong>启用状态</strong>
                    <span>{draft.status === 'enabled' ? '该账号可用于 API 发信。' : '未启用时不会参与发信。'}</span>
                  </div>
                  <Switch
                    checked={draft.status === 'enabled'}
                    onChange={(checked) =>
                      setDraft((current) =>
                        current ? { ...current, status: checked ? 'enabled' : 'disabled' } : current,
                      )
                    }
                  />
                </div>

                <div className="next-job-create__field">
                  <label>备注</label>
                  <Input.TextArea
                    value={draft.note}
                    onChange={(value) =>
                      setDraft((current) => (current ? { ...current, note: value } : current))
                    }
                    autoSize={{ minRows: 4, maxRows: 6 }}
                  />
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请先新增发信账号，再继续维护模板和签名。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
