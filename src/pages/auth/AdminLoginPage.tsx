import { Button, Card, Form, Input, Message, Typography } from '@arco-design/web-react'
import { IconLock, IconUser } from '@arco-design/web-react/icon'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../apis/http'
import { useAuth } from '../../providers/AuthProvider'

interface LoginFormValues {
  username_or_email: string
  password: string
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm<LoginFormValues>()

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  const handleSubmit = async () => {
    const values = await form.validate()
    setSubmitting(true)

    try {
      await login(values.username_or_email.trim(), values.password)
      Message.success('登录成功')
      navigate(redirectTo, { replace: true })
    } catch (error) {
      Message.error(getApiErrorMessage(error, '登录失败，请检查账号或密码'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="next-auth-screen">
      <div className="next-auth-screen__bg" />
      <Card bordered={false} className="next-auth-card">
        <div className="next-auth-card__badge">HR</div>
        <div className="next-auth-form__header">
          <Typography.Title heading={3} className="next-auth-card__title">
            登录后台
          </Typography.Title>
          <Typography.Paragraph className="next-auth-card__desc">
            使用管理员用户名或邮箱继续进入系统。
          </Typography.Paragraph>
        </div>

        <Form<LoginFormValues> form={form} layout="vertical" className="next-auth-form">
          <Form.Item
            field="username_or_email"
            label="用户名或邮箱"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input prefix={<IconUser />} placeholder="例如：admin 或 admin@example.com" />
          </Form.Item>

          <Form.Item
            field="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<IconLock />} placeholder="输入管理员密码" />
          </Form.Item>

          <Button long type="primary" size="large" loading={submitting} onClick={handleSubmit}>
            登录后台
          </Button>

          <div className="next-auth-form__hint">
            首次联调可先使用服务端创建的超级管理员账号。
          </div>
        </Form>
      </Card>
    </div>
  )
}
