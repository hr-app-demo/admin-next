import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
} from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'
import { useMemo, useState } from 'react'

interface AccountRecord {
  id: string
  name: string
  email: string
  role: string
  status: '启用' | '停用'
  phone: string
  note: string
  lastLogin: string
}

const initialAccounts: AccountRecord[] = [
  {
    id: 'account-1',
    name: 'Ada Zhang',
    email: 'admin@example.com',
    role: '管理员',
    status: '启用',
    phone: '+86 138 0000 0001',
    note: '负责整体招聘运营与权限配置。',
    lastLogin: '2026-03-30 10:20',
  },
  {
    id: 'account-2',
    name: 'Mia Chen',
    email: 'mia@example.com',
    role: '招聘经理',
    status: '启用',
    phone: '+86 138 0000 0002',
    note: '主负责 UK 与 EU 区域岗位。',
    lastLogin: '2026-03-31 08:40',
  },
  {
    id: 'account-3',
    name: 'Tony Lin',
    email: 'tony@example.com',
    role: '招聘专员',
    status: '停用',
    phone: '+86 138 0000 0003',
    note: '历史账号，当前已停用。',
    lastLogin: '2026-03-20 19:15',
  },
]

function createEmptyAccount(index: number): AccountRecord {
  return {
    id: `account-new-${index + 1}`,
    name: '',
    email: '',
    role: '招聘专员',
    status: '启用',
    phone: '',
    note: '',
    lastLogin: '未登录',
  }
}

export default function ProfileSettingsPage() {
  const [accounts, setAccounts] = useState<AccountRecord[]>(initialAccounts)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [form] = Form.useForm<AccountRecord>()

  const filteredAccounts = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    if (!search) return accounts
    return accounts.filter((item) =>
      [item.name, item.email, item.role, item.phone].some((field) =>
        field.toLowerCase().includes(search),
      ),
    )
  }, [accounts, keyword])

  const openCreateDrawer = () => {
    const draft = createEmptyAccount(accounts.length)
    setEditingId(null)
    form.setFieldsValue(draft)
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
    const nextRecord: AccountRecord = {
      ...values,
      id: editingId || `account-${Date.now()}`,
      status: values.status || '启用',
      lastLogin: editingId
        ? accounts.find((item) => item.id === editingId)?.lastLogin || '未登录'
        : '未登录',
    }

    if (editingId) {
      setAccounts((current) =>
        current.map((item) => (item.id === editingId ? nextRecord : item)),
      )
      Message.success('账号已保存')
    } else {
      setAccounts((current) => [nextRecord, ...current])
      Message.success('账号已创建')
    }

    closeDrawer()
  }

  const handleDelete = (id: string) => {
    setAccounts((current) => current.filter((item) => item.id !== id))
    Message.success('账号已删除')
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
        <Table
          rowKey="id"
          pagination={{ pageSize: 8 }}
          data={filteredAccounts}
          columns={[
            { title: '姓名', dataIndex: 'name' },
            { title: '邮箱账号', dataIndex: 'email' },
            { title: '角色', dataIndex: 'role' },
            { title: '手机号', dataIndex: 'phone' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value: AccountRecord['status']) => (
                <Tag color={value === '启用' ? 'green' : 'gray'}>{value}</Tag>
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
                  <Popconfirm title="确认删除这个账号吗？" onOk={() => handleDelete(record.id)}>
                    <Button size="mini" status="danger">
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        width={480}
        title={editingId ? '编辑账号' : '新增账号'}
        visible={drawerVisible}
        onCancel={closeDrawer}
        footer={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form<AccountRecord> form={form} layout="vertical">
          <Form.Item field="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="输入账号姓名" />
          </Form.Item>

          <Form.Item field="email" label="邮箱账号" rules={[{ required: true, message: '请输入邮箱账号' }]}>
            <Input placeholder="输入邮箱账号" />
          </Form.Item>

          <Form.Item field="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="选择角色">
              {['管理员', '招聘经理', '招聘专员', '审核员'].map((role) => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item field="phone" label="手机号">
            <Input placeholder="输入手机号" />
          </Form.Item>

          <Form.Item field="status" label="账号状态" rules={[{ required: true, message: '请选择账号状态' }]}>
            <Select placeholder="选择账号状态">
              <Select.Option value="启用">启用</Select.Option>
              <Select.Option value="停用">停用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item field="note" label="备注">
            <Input.TextArea placeholder="填写备注信息" autoSize={{ minRows: 4, maxRows: 6 }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
