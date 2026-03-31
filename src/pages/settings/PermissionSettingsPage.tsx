import {
  Button,
  Card,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Space,
  Switch,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'

interface RoleRecord {
  id: string
  name: string
  description: string
  enabled: boolean
  permissions: string[]
}

const permissionCatalog = [
  { group: '岗位管理', items: ['查看岗位', '编辑岗位', '发布岗位', '复制岗位'] },
  { group: '招聘进展', items: ['查看招聘进展', '流转阶段', '批量操作', '上传附件'] },
  { group: '总人才库', items: ['查看人才库', '编辑候选人', '导出候选人'] },
  { group: '邮件模块', items: ['查看邮件模板', '编辑邮件模板', '管理发信账号'] },
  { group: '系统设置', items: ['管理账号', '管理角色', '管理字典与表单'] },
]

const initialRoles: RoleRecord[] = [
  {
    id: 'role-admin',
    name: '管理员',
    description: '拥有后台全部模块的配置与操作权限。',
    enabled: true,
    permissions: permissionCatalog.flatMap((group) => group.items),
  },
  {
    id: 'role-manager',
    name: '招聘经理',
    description: '负责岗位、招聘进展与团队协作。',
    enabled: true,
    permissions: ['查看岗位', '编辑岗位', '发布岗位', '查看招聘进展', '流转阶段', '批量操作', '查看人才库', '编辑候选人', '查看邮件模板'],
  },
  {
    id: 'role-specialist',
    name: '招聘专员',
    description: '主要负责候选人跟进、附件维护与通知发送。',
    enabled: true,
    permissions: ['查看岗位', '查看招聘进展', '上传附件', '查看人才库', '查看邮件模板'],
  },
]

function createEmptyRole(index: number): RoleRecord {
  return {
    id: `role-new-${index + 1}`,
    name: `新角色 ${index + 1}`,
    description: '',
    enabled: true,
    permissions: [],
  }
}

export default function PermissionSettingsPage() {
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles)
  const [selectedId, setSelectedId] = useState(initialRoles[0]?.id || '')
  const [draft, setDraft] = useState<RoleRecord | null>(initialRoles[0] || null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isCreating) return
    const current = roles.find((item) => item.id === selectedId) || roles[0] || null
    setSelectedId(current?.id || '')
    setDraft(current ? { ...current, permissions: [...current.permissions] } : null)
  }, [isCreating, roles, selectedId])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId('')
    setDraft(createEmptyRole(roles.length))
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyRole(roles.length))
      return
    }
    const current = roles.find((item) => item.id === selectedId) || null
    setDraft(current ? { ...current, permissions: [...current.permissions] } : null)
  }

  const handleSave = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      Message.warning('请先填写角色名称')
      return
    }
    const next = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
    }
    if (isCreating) {
      setRoles((current) => [...current, next])
      Message.success('角色已创建')
    } else {
      setRoles((current) => current.map((item) => (item.id === next.id ? next : item)))
      Message.success('角色已保存')
    }
    setIsCreating(false)
    setSelectedId(next.id)
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = roles[0] || null
      setSelectedId(fallback?.id || '')
      setDraft(fallback ? { ...fallback, permissions: [...fallback.permissions] } : null)
      return
    }
    const next = roles.filter((item) => item.id !== draft.id)
    setRoles(next)
    const fallback = next[0] || null
    setSelectedId(fallback?.id || '')
    setDraft(fallback ? { ...fallback, permissions: [...fallback.permissions] } : null)
    Message.success('角色已删除')
  }

  const togglePermission = (permission: string, checked: boolean) => {
    setDraft((current) => {
      if (!current) return current
      const next = checked
        ? Array.from(new Set([...current.permissions, permission]))
        : current.permissions.filter((item) => item !== permission)
      return { ...current, permissions: next }
    })
  }

  return (
    <div className="next-admin-page">
      <div className="next-settings-layout">
        <Card
          bordered={false}
          className="next-panel"
          title="权限与角色"
          extra={
            <Button size="small" icon={<IconPlus />} onClick={beginCreate}>
              新增角色
            </Button>
          }
        >
          <div className="next-settings-nav">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`next-settings-nav__item${!isCreating && selectedId === role.id ? ' is-active' : ''}`}
                onClick={() => {
                  setIsCreating(false)
                  setSelectedId(role.id)
                }}
              >
                <div>
                  <strong>{role.name}</strong>
                  <span>{role.permissions.length} 项权限</span>
                </div>
                <Tag color={role.enabled ? 'green' : 'gray'}>{role.enabled ? '启用' : '停用'}</Tag>
              </button>
            ))}

            {isCreating ? (
              <button type="button" className="next-settings-nav__item is-active">
                <div>
                  <strong>新角色</strong>
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
            title={isCreating ? '新建角色' : '角色详情'}
            extra={
              <Space>
                <Button icon={<IconRefresh />} onClick={handleReset}>
                  重置
                </Button>
                <Popconfirm title={isCreating ? '放弃当前新角色？' : '确认删除这个角色吗？'} onOk={handleDelete}>
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
                    <label>角色名称</label>
                    <Input value={draft.name} onChange={(value) => setDraft((current) => (current ? { ...current, name: value } : current))} />
                  </div>
                  <div className="next-job-create__switch-card">
                    <div>
                      <strong>角色状态</strong>
                      <span>{draft.enabled ? '启用后可以继续分配给账户。' : '停用后不再允许分配给新账户。'}</span>
                    </div>
                    <Switch
                      checked={draft.enabled}
                      onChange={(checked) => setDraft((current) => (current ? { ...current, enabled: checked } : current))}
                    />
                  </div>
                </div>

                <div className="next-job-create__field">
                  <label>角色说明</label>
                  <Input.TextArea
                    value={draft.description}
                    onChange={(value) => setDraft((current) => (current ? { ...current, description: value } : current))}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </div>

                <div className="next-job-detail__list">
                  <div className="next-job-detail__list-item">
                    成员归属不在这里维护，直接去`账户管理`里给账号选择角色即可。
                  </div>
                </div>

                <div className="next-settings-workspace__section">
                  <div className="next-settings-workspace__section-header">
                    <div>
                      <strong>权限配置</strong>
                      <div className="next-job-create__field-tip">按模块勾选权限项，后面接真实 RBAC 时可以直接映射。</div>
                    </div>
                  </div>

                  <div className="next-settings-workspace__cards">
                    {permissionCatalog.map((group) => (
                      <Card key={group.group} bordered={false} className="next-job-create__subcard" title={group.group}>
                        <div className="next-settings-workspace__permission-grid">
                          {group.items.map((item) => (
                            <Checkbox
                              key={item}
                              checked={draft.permissions.includes(item)}
                              onChange={(checked) => togglePermission(item, checked)}
                            >
                              {item}
                            </Checkbox>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="next-empty-state">请选择要维护的角色。</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
