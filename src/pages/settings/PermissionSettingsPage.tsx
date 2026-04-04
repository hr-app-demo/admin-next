import {
  Button,
  Card,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Space,
  Spin,
  Switch,
  Tag,
} from '@arco-design/web-react'
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import {
  createAdminRole,
  deleteAdminRole,
  listAdminRoles,
  updateAdminRole,
} from '../../apis/settings/roles'
import { listPermissionCatalog } from '../../apis/settings/permissions'
import { getApiErrorMessage } from '../../apis/http'
import type { AdminRole, PermissionCatalogGroup } from '../../apis/types'
import { useAuth } from '../../providers/AuthProvider'

interface RoleRecord {
  id: number
  name: string
  description: string
  enabled: boolean
  permissions: string[]
}

function toRoleRecord(role: AdminRole): RoleRecord {
  return {
    id: role.id,
    name: role.name,
    description: role.description || '',
    enabled: role.enabled,
    permissions: [...role.permissions],
  }
}

function createEmptyRole(): RoleRecord {
  return {
    id: 0,
    name: '',
    description: '',
    enabled: true,
    permissions: [],
  }
}

export default function PermissionSettingsPage() {
  const { refreshCurrentUser } = useAuth()
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalogGroup[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<RoleRecord | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = async (
    preferredSelectedId: number | null = selectedId,
    preserveCreateState: boolean = isCreating,
  ) => {
    setLoading(true)
    try {
      const [roleList, catalog] = await Promise.all([listAdminRoles(), listPermissionCatalog()])
      const nextRoles = roleList.map(toRoleRecord)
      setRoles(nextRoles)
      setPermissionCatalog(catalog)
      if (!preserveCreateState) {
        const fallback = nextRoles.find((item) => item.id === preferredSelectedId) || nextRoles[0] || null
        setSelectedId(fallback?.id || null)
        setDraft(fallback ? { ...fallback, permissions: [...fallback.permissions] } : null)
      }
    } catch (error) {
      Message.error(getApiErrorMessage(error, '加载角色与权限数据失败'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    if (isCreating) return
    const current = roles.find((item) => item.id === selectedId) || roles[0] || null
    setSelectedId(current?.id || null)
    setDraft(current ? { ...current, permissions: [...current.permissions] } : null)
  }, [isCreating, roles, selectedId])

  const beginCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setDraft(createEmptyRole())
  }

  const handleReset = () => {
    if (isCreating) {
      setDraft(createEmptyRole())
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
    setSaving(true)
    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      enabled: draft.enabled,
      permissions: draft.permissions,
    }

    const action = async () => {
      if (isCreating) {
        const created = await createAdminRole(payload)
        Message.success('角色已创建')
        setIsCreating(false)
        await loadData(created.id, false)
        await refreshCurrentUser()
        return
      } else {
        await updateAdminRole(draft.id, payload)
        Message.success('角色已保存')
        await loadData(draft.id, false)
        await refreshCurrentUser()
        return
      }
    }

    void action()
      .catch((error) => {
        Message.error(getApiErrorMessage(error, isCreating ? '创建角色失败' : '保存角色失败'))
      })
      .finally(() => {
        setSaving(false)
      })
  }

  const handleDelete = () => {
    if (!draft) return
    if (isCreating) {
      setIsCreating(false)
      const fallback = roles[0] || null
      setSelectedId(fallback?.id || null)
      setDraft(fallback ? { ...fallback, permissions: [...fallback.permissions] } : null)
      return
    }
    const action = async () => {
      const deletedRoleId = draft.id
      await deleteAdminRole(deletedRoleId)
      Message.success('角色已删除')
      await loadData(null, false)
      await refreshCurrentUser()
    }

    void action().catch((error) => {
      Message.error(getApiErrorMessage(error, '删除角色失败'))
    })
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
          <Spin loading={loading} block>
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
          </Spin>
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
                <Button type="primary" loading={saving} onClick={handleSave}>
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
                      <div className="next-job-create__field-tip">当前先维护菜单与页面访问权限，功能级权限后续再细化。</div>
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
