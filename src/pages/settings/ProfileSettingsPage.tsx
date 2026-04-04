import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import { useEffect, useMemo, useState } from 'react'
import {
  createAdminAccount,
  deleteAdminAccount,
  listAdminAccounts,
  type AdminAccountCreatePayload,
  updateAdminAccount,
} from '../../apis/settings/accounts'
import { listAdminRoles } from '../../apis/settings/roles'
import { getApiErrorMessage } from '../../apis/http'
import type { AdminRole, AdminUser } from '../../apis/types'

interface AccountRecord {
  id: number
  name: string
  username: string
  email: string
  roleId: number | null
  roleName: string
  status: 'enabled' | 'disabled'
  phone: string
  note: string
  lastLogin: string
  isSuperuser: boolean
  password?: string
}

function formatDateTime(value: string | null) {
  if (!value) return '未登录'
  return value.replace('T', ' ').slice(0, 16)
}

function toAccountRecord(account: AdminUser): AccountRecord {
  return {
    id: account.id,
    name: account.name,
    username: account.username,
    email: account.email,
    roleId: account.role_id,
    roleName: account.role_name || '未分配',
    status: account.status,
    phone: account.phone || '',
    note: account.note || '',
    lastLogin: formatDateTime(account.last_login_at),
    isSuperuser: account.is_superuser,
  }
}

function createEmptyAccount(): AccountRecord {
  return {
    id: 0,
    name: '',
    username: '',
    email: '',
    roleId: null,
    roleName: '',
    status: 'enabled',
    phone: '',
    note: '',
    lastLogin: '未登录',
    isSuperuser: false,
    password: '',
  }
}

export default function ProfileSettingsPage() {
  const [accounts, setAccounts] = useState<AccountRecord[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<AccountRecord>()
  const editingRecord = useMemo(
    () => (editingId ? accounts.find((item) => item.id === editingId) || null : null),
    [accounts, editingId],
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const [accountList, roleList] = await Promise.all([listAdminAccounts(keyword), listAdminRoles()])
      setAccounts(accountList.map(toAccountRecord))
      setRoles(roleList)
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载账号数据失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredAccounts = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    if (!search) return accounts

    return accounts.filter((item) =>
      [item.name, item.username, item.email, item.roleName, item.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search)),
    )
  }, [accounts, keyword])

  const openCreateDrawer = () => {
    setEditingId(null)
    form.setFieldsValue(createEmptyAccount())
    setDrawerVisible(true)
  }

  const openEditDrawer = (record: AccountRecord) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const values = await form.validate()
    setSubmitting(true)

    try {
      if (editingId) {
        const payload = {
          name: values.name.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          phone: values.phone?.trim() || undefined,
          note: values.note?.trim() || undefined,
          status: values.status,
          role_id: values.roleId ?? null,
          password: values.password?.trim() || undefined,
        }
        await updateAdminAccount(editingId, payload)
        Message.success('账号已保存')
      } else {
        const payload: AdminAccountCreatePayload = {
          name: values.name.trim(),
          username: values.username.trim() || undefined,
          email: values.email.trim(),
          phone: values.phone?.trim() || undefined,
          note: values.note?.trim() || undefined,
          status: values.status,
          role_id: values.roleId ?? undefined,
          password: values.password?.trim() || undefined,
        }
        const created = await createAdminAccount(payload)
        Message.success('账号已创建')
        if (created.temporary_password) {
          Modal.info({
            title: '已生成临时密码',
            content: `当前账号临时密码：${created.temporary_password}`,
          })
        }
      }

      await loadData()
      closeDrawer()
    } catch (error) {
      Message.error(getApiErrorMessage(error, editingId ? '保存账号失败' : '创建账号失败'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminAccount(id)
      Message.success('账号已删除')
      await loadData()
    } catch (error) {
      Message.error(getApiErrorMessage(error, '删除账号失败'))
    }
  }

  return (
    <div className="next-admin-page">
      <Card
        bordered={false}
        className="next-panel"
        title="账户管理"
        extra={
          <Space>
            <Input.Search
              allowClear
              placeholder="搜索姓名、邮箱、角色"
              style={{ width: 260 }}
              value={keyword}
              onChange={setKeyword}
            />
            <Button type="primary" icon={<IconPlus />} onClick={openCreateDrawer}>
              新增账号
            </Button>
          </Space>
        }
      >
        <Spin loading={loading} block>
          <Table
            rowKey="id"
            pagination={{ pageSize: 8 }}
            data={filteredAccounts}
            columns={[
              { title: '姓名', dataIndex: 'name' },
              { title: '用户名', dataIndex: 'username' },
              { title: '邮箱账号', dataIndex: 'email' },
              {
                title: '角色',
                dataIndex: 'roleName',
                render: (_: unknown, record: AccountRecord) =>
                  record.isSuperuser ? <Tag color="gold">超管账户</Tag> : record.roleName,
              },
              { title: '手机号', dataIndex: 'phone' },
              {
                title: '状态',
                dataIndex: 'status',
                render: (value: AccountRecord['status'], record: AccountRecord) => (
                  <Tag color={record.isSuperuser ? 'arcoblue' : value === 'enabled' ? 'green' : 'gray'}>
                    {record.isSuperuser ? '超管固定启用' : value === 'enabled' ? '启用' : '停用'}
                  </Tag>
                ),
              },
              { title: '最近登录', dataIndex: 'lastLogin' },
              {
                title: '操作',
                width: 180,
                render: (_: unknown, record: AccountRecord) => (
                  <Space>
                    <Button size="mini" onClick={() => openEditDrawer(record)}>
                      编辑
                    </Button>
                    {record.isSuperuser ? (
                      <Button size="mini" disabled>
                        不可删除
                      </Button>
                    ) : (
                      <Popconfirm title="确认删除这个账号吗？" onOk={() => void handleDelete(record.id)}>
                        <Button size="mini" status="danger">
                          删除
                        </Button>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
          />
        </Spin>
      </Card>

      <Drawer
        width={480}
        title={editingId ? '编辑账号' : '新增账号'}
        visible={drawerVisible}
        onCancel={closeDrawer}
        footer={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button type="primary" loading={submitting} onClick={() => void handleSubmit()}>
              保存
            </Button>
          </Space>
        }
      >
        <Form<AccountRecord> form={form} layout="vertical">
          <Form.Item field="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="输入账号姓名" />
          </Form.Item>

          <Form.Item field="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="输入登录用户名，只支持小写字母和数字" />
          </Form.Item>

          <Form.Item field="email" label="邮箱账号" rules={[{ required: true, message: '请输入邮箱账号' }]}>
            <Input placeholder="输入邮箱账号" />
          </Form.Item>

          <Form.Item field="roleId" label="角色">
            <Select placeholder={editingRecord?.isSuperuser ? '超管账户不绑定普通角色' : '选择角色'} disabled={editingRecord?.isSuperuser}>
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id} disabled={!role.enabled}>
                  {role.name}
                  {!role.enabled ? '（已停用）' : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item field="phone" label="手机号">
            <Input placeholder="输入手机号" />
          </Form.Item>

          <Form.Item field="status" label="账号状态" rules={[{ required: true, message: '请选择账号状态' }]}>
            <Select placeholder="选择账号状态" disabled={editingRecord?.isSuperuser}>
              <Select.Option value="enabled">启用</Select.Option>
              <Select.Option value="disabled">停用</Select.Option>
            </Select>
          </Form.Item>

          {editingRecord?.isSuperuser ? (
            <div className="next-form-inline-hint">
              超管账号固定为启用状态，且不参与普通角色分配。
            </div>
          ) : null}

          <Form.Item field="password" label={editingId ? '重置密码' : '初始密码'}>
            <Input.Password placeholder={editingId ? '留空则不修改密码' : '留空则由后端生成临时密码'} />
          </Form.Item>

          <Form.Item field="note" label="备注">
            <Input.TextArea placeholder="填写备注信息" autoSize={{ minRows: 4, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
