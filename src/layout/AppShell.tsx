import { Avatar, Badge, Button, Dropdown, Form, Input, Layout, Menu, Message, Modal, Space } from '@arco-design/web-react'
import {
  IconDashboard,
  IconFile,
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
  IconLock,
  IconSettings,
  IconUser,
} from '@arco-design/web-react/icon'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { changeAdminPassword } from '../apis/auth'
import { getApiErrorMessage } from '../apis/http'
import {
  getVisibleMailItems,
  getVisibleTopLevelItems,
  getVisibleSettingsItems,
} from '../lib/route-access'
import { useAuth } from '../providers/AuthProvider'

const { Sider, Header, Content } = Layout

const topLevelItems = [
  { key: '/dashboard', label: '工作台', icon: <IconDashboard /> },
  { key: '/jobs', label: '岗位管理', icon: <IconFile /> },
  { key: '/candidates', label: '总人才库', icon: <IconUser /> },
]

const mailItems = [
  { key: '/mail/templates', label: '邮件模板' },
  { key: '/mail/signatures', label: '邮件签名模板' },
  { key: '/mail/accounts', label: '邮箱账号管理' },
]

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '招聘运营工作台', subtitle: '快速查看核心数据、趋势和待处理动态。' },
  '/jobs': { title: '岗位管理', subtitle: '统一管理岗位信息、配置和申请概览。' },
  '/candidates': { title: '总人才库', subtitle: '不分岗位地管理候选人资产与可复用人才。' },
  '/mail': { title: '邮件与模板', subtitle: '集中维护邮件模板、签名模板与发信账号。' },
  '/settings': { title: '系统设置', subtitle: '将账户、权限、常量字典与报名表策略收敛到统一二级配置。' },
  '/no-access': { title: '暂无访问权限', subtitle: '当前账号未分配可访问模块，请联系超级管理员。' },
}

function resolveSection(pathname: string) {
  if (pathname.startsWith('/no-access')) return '/no-access'
  if (pathname.startsWith('/settings')) return '/settings'
  if (pathname.startsWith('/mail')) return '/mail'
  const exact = topLevelItems.find((item) => pathname === item.key)
  if (exact) return exact.key
  const prefix = topLevelItems.find((item) => pathname.startsWith(item.key + '/'))
  return prefix?.key || '/no-access'
}

function resolveSelectedKey(pathname: string) {
  if (pathname === '/no-access') return ''
  if (pathname === '/settings') return '/settings/account'
  if (pathname.startsWith('/settings/')) return pathname
  if (pathname === '/mail') return '/mail/templates'
  if (pathname.startsWith('/mail/')) return pathname
  return resolveSection(pathname)
}

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const { currentUser, logout } = useAuth()
  const [passwordForm] = Form.useForm<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>()
  const selectedKey = resolveSelectedKey(location.pathname)
  const visibleTopLevelKeys = useMemo(
    () => new Set(getVisibleTopLevelItems(currentUser).map((item) => item.key)),
    [currentUser],
  )
  const visibleTopLevelItems = useMemo(
    () => topLevelItems.filter((item) => visibleTopLevelKeys.has(item.key)),
    [visibleTopLevelKeys],
  )
  const visibleMailKeys = useMemo(
    () => new Set(getVisibleMailItems(currentUser).map((item) => item.key)),
    [currentUser],
  )
  const visibleMailItems = useMemo(
    () => mailItems.filter((item) => visibleMailKeys.has(item.key)),
    [visibleMailKeys],
  )
  const visibleSettingsItems = useMemo(() => getVisibleSettingsItems(currentUser), [currentUser])
  const canSeeMail = visibleMailItems.length > 0
  const canSeeSettings = visibleSettingsItems.length > 0

  const pageMeta = useMemo(
    () => pageTitles[resolveSection(location.pathname)] || pageTitles['/no-access'],
    [location.pathname],
  )

  const initials = useMemo(() => {
    const source = currentUser?.name?.trim() || currentUser?.username || 'AD'
    return source.slice(0, 2).toUpperCase()
  }, [currentUser])

  const handleChangePassword = async () => {
    const values = await passwordForm.validate()
    if (values.newPassword !== values.confirmPassword) {
      Message.error('两次输入的新密码不一致')
      return
    }

    setChangingPassword(true)
    try {
      await changeAdminPassword(values.currentPassword, values.newPassword)
      Message.success('密码修改成功，请重新登录')
      setPasswordModalVisible(false)
      passwordForm.resetFields()
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      Message.error(getApiErrorMessage(error, '修改密码失败'))
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <Layout className="next-admin-shell" hasSider>
      <Sider
        width={collapsed ? 72 : 260}
        className={`next-admin-sider${collapsed ? ' is-collapsed' : ''}`}
        style={{
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          maxWidth: collapsed ? 72 : 260,
          flex: `0 0 ${collapsed ? 72 : 260}px`,
          transition: 'all 0.2s ease',
        }}
      >
        <div className="next-admin-brand">
          <div className="next-admin-brand__mark">DA</div>
          {!collapsed ? (
            <div className="next-admin-brand__copy">
              <strong>DA Admin Next</strong>
              <span>Recruiting operations workspace</span>
            </div>
          ) : null}
        </div>

        <Menu
          className="next-admin-menu"
          collapse={collapsed}
          style={{ width: '100%', height: 'calc(100vh - 88px)' }}
          selectedKeys={selectedKey ? [selectedKey] : []}
          defaultOpenKeys={['/mail', '/settings']}
          onClickMenuItem={(key) => navigate(key)}
        >
          {visibleTopLevelItems.map((item) => (
            <Menu.Item key={item.key}>
              {item.icon}
              {item.label}
            </Menu.Item>
          ))}

          {canSeeMail ? (
            <Menu.SubMenu
              key="/mail"
              title={
                <>
                  <IconNotification />
                  邮件与模板
                </>
              }
            >
              {visibleMailItems.map((item) => (
                <Menu.Item key={item.key} title={item.label}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ) : null}

          {canSeeSettings ? (
            <Menu.SubMenu
              key="/settings"
              title={
                <>
                  <IconSettings />
                  系统设置
                </>
              }
            >
              {visibleSettingsItems.map((item) => (
                <Menu.Item key={item.key} title={item.label}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ) : null}
        </Menu>
      </Sider>

      <Layout>
        <Header className="next-admin-header">
          <div className="next-admin-header__left">
            <Button
              shape="circle"
              type="secondary"
              icon={collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              onClick={() => setCollapsed((value) => !value)}
            />
            <div>
              <div className="next-admin-header__title">{pageMeta.title}</div>
              <div className="next-admin-header__subtitle">{pageMeta.subtitle}</div>
            </div>
          </div>

          <Space size={16}>
            <Badge count={3}>
              <Button shape="circle" type="secondary" icon={<IconNotification />} />
            </Badge>
            <Dropdown
              droplist={
                <Menu>
                  <Menu.Item key="change-password" onClick={() => setPasswordModalVisible(true)}>
                    <IconLock />
                    修改密码
                  </Menu.Item>
                  <Menu.Item
                    key="logout"
                    onClick={async () => {
                      await logout()
                      navigate('/login', { replace: true })
                    }}
                  >
                    退出登录
                  </Menu.Item>
                </Menu>
              }
            >
              <Space size={12}>
                <div className="next-admin-header__user">
                  <strong>{currentUser?.name || currentUser?.username || '管理员'}</strong>
                  <span>{currentUser?.is_superuser ? '超级管理员' : currentUser?.role_name || '后台账号'}</span>
                </div>
                <Avatar style={{ background: '#165dff', cursor: 'pointer' }}>{initials}</Avatar>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content className="next-admin-content">
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="修改密码"
        visible={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setPasswordModalVisible(false)
                passwordForm.resetFields()
              }}
            >
              取消
            </Button>
            <Button type="primary" loading={changingPassword} onClick={() => void handleChangePassword()}>
              确认修改
            </Button>
          </Space>
        }
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            field="currentPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="输入当前登录密码" />
          </Form.Item>
          <Form.Item
            field="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="至少 8 位，管理员密码不允许空白字符" />
          </Form.Item>
          <Form.Item
            field="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
