import { Avatar, Badge, Button, Dropdown, Layout, Menu, Space } from '@arco-design/web-react'
import {
  IconDashboard,
  IconFile,
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
  IconSafe,
  IconSettings,
  IconUser,
} from '@arco-design/web-react/icon'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

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

const settingsItems = [
  { key: '/settings/account', label: '账户管理' },
  { key: '/settings/permission', label: '权限与角色' },
  { key: '/settings/dictionaries', label: '常量字典' },
  { key: '/settings/form', label: '报名表单策略' },
]

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '招聘运营工作台', subtitle: '快速查看核心数据、趋势和待处理动态。' },
  '/jobs': { title: '岗位管理', subtitle: '统一管理岗位信息、配置和申请概览。' },
  '/candidates': { title: '总人才库', subtitle: '不分岗位地管理候选人资产与可复用人才。' },
  '/mail': { title: '邮件与模板', subtitle: '集中维护邮件模板、签名模板与发信账号。' },
  '/settings': { title: '系统设置', subtitle: '将账户、权限、常量字典与报名表策略收敛到统一二级配置。' },
}

function resolveSection(pathname: string) {
  if (pathname.startsWith('/settings')) return '/settings'
  if (pathname.startsWith('/mail')) return '/mail'
  const exact = topLevelItems.find((item) => pathname === item.key)
  if (exact) return exact.key
  const prefix = topLevelItems.find((item) => pathname.startsWith(item.key + '/'))
  return prefix?.key || '/dashboard'
}

function resolveSelectedKey(pathname: string) {
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
  const selectedKey = resolveSelectedKey(location.pathname)

  const pageMeta = useMemo(
    () => pageTitles[resolveSection(location.pathname)] || pageTitles['/dashboard'],
    [location.pathname],
  )

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
          {topLevelItems.map((item) => (
            <Menu.Item key={item.key}>
              {item.icon}
              {item.label}
            </Menu.Item>
          ))}

          <Menu.SubMenu
            key="/mail"
            title={
              <>
                <IconNotification />
                邮件与模板
              </>
            }
          >
            {mailItems.map((item) => (
              <Menu.Item key={item.key} title={item.label}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>

          <Menu.SubMenu
            key="/settings"
            title={
              <>
                <IconSettings />
                系统设置
              </>
            }
          >
            {settingsItems.map((item) => (
              <Menu.Item key={item.key} title={item.label}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
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
                  <Menu.Item key="account" onClick={() => navigate('/settings/account')}>
                    <IconSafe />
                    账户管理
                  </Menu.Item>
                </Menu>
              }
            >
              <Avatar style={{ background: '#165dff', cursor: 'pointer' }}>AD</Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content className="next-admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
