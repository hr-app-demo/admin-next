import { Button, Card, Typography } from '@arco-design/web-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'

export default function NoAccessPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="next-admin-page">
      <Card bordered={false} className="next-panel">
        <div className="next-empty-state">
          <Typography.Title heading={4} style={{ marginBottom: 8 }}>
            当前账号暂无可访问模块
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: 20 }}>
            当前账号没有被分配任何后台访问权限，请联系超级管理员为你配置角色或权限。
          </Typography.Paragraph>
          <Button
            type="primary"
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
          >
            返回登录页
          </Button>
        </div>
      </Card>
    </div>
  )
}
